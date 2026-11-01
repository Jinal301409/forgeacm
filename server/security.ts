/**
 * CivicLens AI - Security & Sanitation Helpers
 */
import { Request, Response, NextFunction } from 'express';

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.removeHeader('X-Powered-By');
    next();
}

interface Bucket {
    count: number;
    resetAt: number;
}

export function rateLimit(opts: { windowMs: number; max: number; name: string; message?: string }) {
    const buckets = new Map<string, Bucket>();

    setInterval(() => {
        const now = Date.now();
        for (const [key, b] of buckets) if (b.resetAt <= now) buckets.delete(key);
    }, Math.max(opts.windowMs, 60_000)).unref();

    return (req: Request, res: Response, next: NextFunction): void => {
        const key = `${opts.name}:${req.ip || req.socket.remoteAddress || 'unknown'}`;
        const now = Date.now();
        let b = buckets.get(key);
        if (!b || b.resetAt <= now) {
            b = { count: 0, resetAt: now + opts.windowMs };
            buckets.set(key, b);
        }
        b.count += 1;

        res.setHeader('X-RateLimit-Limit', String(opts.max));
        res.setHeader('X-RateLimit-Remaining', String(Math.max(0, opts.max - b.count)));

        if (b.count > opts.max) {
            const retry = Math.ceil((b.resetAt - now) / 1000);
            res.setHeader('Retry-After', String(retry));
            res.status(429).json({
                error: opts.message || `Too many requests. Please wait ${retry} seconds and try again.`,
            });
            return;
        }
        next();
    };
}

export function sanitizeText(value: unknown, maxLength = 5000): string {
    if (typeof value !== 'string') return '';
    return value.replace(/\u0000/g, '').trim().slice(0, maxLength);
}

export function isValidEmail(email: unknown): email is string {
    return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}