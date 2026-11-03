/**
 * CivicLens AI - Full-Stack Express & Vite Server Entry
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes.js';
import { loadDatabase } from './server/db.js';
import { connectToMongoDB, closeMongoDB } from './server/mongodb.js';

dotenv.config();

// Automatically upgrade deprecated models to gemini-3.8-flash
if (!process.env.GEMINI_MODEL || process.env.GEMINI_MODEL.startsWith('gemini-2.') || process.env.GEMINI_MODEL.startsWith('gemini-1.')) {
  process.env.GEMINI_MODEL = 'gemini-3.8-flash';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Security headers middleware (permit embedding in AI Studio workspace preview)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // CORS Configuration - Explicitly allows frontend at https://forgeacm-cwy4.vercel.app
  const defaultOrigins = [
    'https://forgeacm-cwy4.vercel.app',
    'https://civiclens-ai-77ex.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
  ];
  const configuredOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean) || [];
  const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        if (/^https:\/\/forgeacm.*\.vercel\.app$/.test(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS origin ${origin} not allowed by policy`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Static uploads directory
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Initialize local database cache (for non-production local development only)
  loadDatabase();

  // Connect to MongoDB Atlas (required in production)
  await connectToMongoDB();

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Return JSON 404 for any unmatched /api/* routes, preventing HTML fallback
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // Vite integration
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  // Centralized error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: err.message || 'An unexpected internal server error occurred.' });
  });

  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`CivicLens AI full-stack server running on http://0.0.0.0:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await closeMongoDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
  console.error('[Server Process] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Server Process] Uncaught Exception:', err);
});

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
