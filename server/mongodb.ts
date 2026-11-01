/**
 * CivicLens AI - MongoDB Atlas Centralized Database Connection & Lifecycle Manager
 * Handles connection pooling, auto-reconnection, index creation, initial data migration,
 * and graceful shutdown.
 */

import { MongoClient, Db, Collection, ServerApiVersion } from 'mongodb';
import fs from 'fs';
import path from 'path';

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let isConnected = false;
let connectionError: string | null = null;
let connectionAttempted = false;

export const DB_NAME = process.env.MONGODB_DB_NAME || 'civiclens';

export interface MongoHealthStatus {
  connected: boolean;
  databaseName: string;
  pingLatencyMs: number | null;
  error: string | null;
  collections: Record<string, number>;
}

/**
 * Initializes and establishes connection to MongoDB Atlas.
 */
export async function connectToMongoDB(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI?.trim();
  connectionAttempted = true;

  if (!uri || uri.includes('<username>') || uri.includes('<password>') || uri.includes('<cluster>')) {
    console.warn('[MongoDB Atlas] MONGODB_URI is not configured with real cluster credentials.');
    isConnected = false;
    connectionError = 'MONGODB_URI is not defined or contains placeholder credentials.';
    return null;
  }

  try {
    console.log(`[MongoDB Atlas] Connecting to cluster for database "${DB_NAME}"...`);

    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      },
      maxPoolSize: 20,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 8000,
    });

    await client.connect();

    // Verify connection by pinging admin db
    const pingStart = Date.now();
    await client.db('admin').command({ ping: 1 });
    const pingLatency = Date.now() - pingStart;

    dbInstance = client.db(DB_NAME);
    isConnected = true;
    connectionError = null;

    console.log(`[MongoDB Atlas] Successfully connected to database "${DB_NAME}" (${pingLatency}ms latency).`);

    // Ensure database indexes
    await setupIndexes(dbInstance);

    // Seed initial collections if empty
    await seedInitialData(dbInstance);

    // Listen to connection closing
    client.on('close', () => {
      console.warn('[MongoDB Atlas] Connection closed.');
      isConnected = false;
    });

    client.on('error', (err) => {
      console.error('[MongoDB Atlas] Client error:', err);
      connectionError = err.message;
    });

    return dbInstance;
  } catch (err: any) {
    if (client) {
      client.close().catch(() => {});
      client = null;
    }
    dbInstance = null;
    isConnected = false;
    connectionError = err.message || 'Unknown MongoDB connection error';
    console.error(`[MongoDB Atlas] Connection failed: ${connectionError}`);
    return null;
  }
}

/**
 * Ensures optimal indexes for query performance, unique constraints, and search.
 */
async function setupIndexes(db: Db): Promise<void> {
  try {
    // 1. Users: unique email index
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ id: 1 }, { unique: true });

    // 2. Civic Reports: unique reportId, index on status, category, userId
    await db.collection('civic_reports').createIndex({ reportId: 1 }, { unique: true });
    await db.collection('civic_reports').createIndex({ id: 1 }, { unique: true });
    await db.collection('civic_reports').createIndex({ userId: 1 });
    await db.collection('civic_reports').createIndex({ status: 1 });
    await db.collection('civic_reports').createIndex({ category: 1 });
    await db.collection('civic_reports').createIndex({ createdAt: -1 });

    // 3. Policies & Explanations
    await db.collection('policies').createIndex({ id: 1 }, { unique: true });
    await db.collection('policies').createIndex({ category: 1 });
    await db.collection('policy_explanations').createIndex({ documentId: 1, language: 1 });

    // 4. Schemes
    await db.collection('government_schemes').createIndex({ id: 1 }, { unique: true });
    await db.collection('government_schemes').createIndex({ category: 1 });

    // 5. Fact Checks
    await db.collection('fact_checks').createIndex({ id: 1 }, { unique: true });
    await db.collection('fact_checks').createIndex({ userId: 1 });

    // 6. Applications
    await db.collection('applications').createIndex({ id: 1 }, { unique: true });
    await db.collection('applications').createIndex({ userId: 1 });

    // 7. Notifications
    await db.collection('notifications').createIndex({ id: 1 }, { unique: true });
    await db.collection('notifications').createIndex({ userId: 1, read: 1 });

    // 8. Bookmarks (compound unique index)
    await db.collection('bookmarks').createIndex({ userId: 1, itemId: 1 }, { unique: true });

    // 9. Audit Logs
    await db.collection('audit_logs').createIndex({ timestamp: -1 });
    await db.collection('audit_logs').createIndex({ userId: 1 });

    console.log('[MongoDB Atlas] All collection indexes verified.');
  } catch (err: any) {
    console.warn('[MongoDB Atlas] Index setup notice:', err.message);
  }
}

/**
 * Seeds initial official data from data/civiclens-db.json into MongoDB Atlas if database is empty.
 */
async function seedInitialData(db: Db): Promise<void> {
  try {
    const userCount = await db.collection('users').countDocuments();
    if (userCount > 0) {
      console.log(`[MongoDB Atlas] Database already contains ${userCount} users. Seeding skipped.`);
      return;
    }

    const dataPath = path.resolve(process.cwd(), 'data/civiclens-db.json');
    if (!fs.existsSync(dataPath)) {
      console.warn('[MongoDB Atlas] Seed file data/civiclens-db.json not found.');
      return;
    }

    const raw = fs.readFileSync(dataPath, 'utf-8');
    const seed = JSON.parse(raw);

    console.log('[MongoDB Atlas] Seeding fresh MongoDB Atlas collections from backup JSON...');

    if (seed.users?.length) {
      await db.collection('users').insertMany(seed.users);
    }
    if (seed.policyDocuments?.length) {
      await db.collection('policies').insertMany(seed.policyDocuments);
    }
    if (seed.policyExplanations?.length) {
      await db.collection('policy_explanations').insertMany(seed.policyExplanations);
    }
    if (seed.schemes?.length) {
      await db.collection('government_schemes').insertMany(seed.schemes);
    }
    if (seed.civicReports?.length) {
      await db.collection('civic_reports').insertMany(seed.civicReports);
    }
    if (seed.factChecks?.length) {
      await db.collection('fact_checks').insertMany(seed.factChecks);
    }
    if (seed.applications?.length) {
      await db.collection('applications').insertMany(seed.applications);
    }
    if (seed.notifications?.length) {
      await db.collection('notifications').insertMany(seed.notifications);
    }
    if (seed.bookmarks?.length) {
      await db.collection('bookmarks').insertMany(seed.bookmarks);
    }
    if (seed.auditLogs?.length) {
      await db.collection('audit_logs').insertMany(seed.auditLogs);
    }

    console.log('[MongoDB Atlas] Data seeding complete: all initial governance records populated.');
  } catch (err: any) {
    console.error('[MongoDB Atlas] Data seeding error:', err);
  }
}

/**
 * Returns current MongoDB instance or null.
 */
export function getDb(): Db | null {
  return isConnected ? dbInstance : null;
}

/**
 * Returns true only if genuine connection to MongoDB Atlas succeeded.
 */
export function isMongoConnected(): boolean {
  return isConnected && dbInstance !== null;
}

/**
 * Returns typed collection from MongoDB if connected, or null.
 */
export function getCollection<T extends Document = any>(name: string): Collection<T> | null {
  if (!isConnected || !dbInstance) return null;
  return dbInstance.collection<T>(name);
}

/**
 * Real health check verifying actual MongoDB ping and collection metrics.
 */
export async function getMongoHealth(): Promise<MongoHealthStatus> {
  if (!isConnected || !client || !dbInstance) {
    return {
      connected: false,
      databaseName: DB_NAME,
      pingLatencyMs: null,
      error: connectionError || (connectionAttempted ? 'Disconnected' : 'Connection not attempted'),
      collections: {},
    };
  }

  try {
    const start = Date.now();
    await client.db('admin').command({ ping: 1 });
    const latency = Date.now() - start;

    const [users, reports, policies, schemes, factChecks, applications, notifications, auditLogs] = await Promise.all([
      dbInstance.collection('users').countDocuments().catch(() => 0),
      dbInstance.collection('civic_reports').countDocuments().catch(() => 0),
      dbInstance.collection('policies').countDocuments().catch(() => 0),
      dbInstance.collection('government_schemes').countDocuments().catch(() => 0),
      dbInstance.collection('fact_checks').countDocuments().catch(() => 0),
      dbInstance.collection('applications').countDocuments().catch(() => 0),
      dbInstance.collection('notifications').countDocuments().catch(() => 0),
      dbInstance.collection('audit_logs').countDocuments().catch(() => 0),
    ]);

    return {
      connected: true,
      databaseName: DB_NAME,
      pingLatencyMs: latency,
      error: null,
      collections: {
        users,
        civic_reports: reports,
        policies,
        government_schemes: schemes,
        fact_checks: factChecks,
        applications,
        notifications,
        audit_logs: auditLogs,
      },
    };
  } catch (err: any) {
    return {
      connected: false,
      databaseName: DB_NAME,
      pingLatencyMs: null,
      error: err.message,
      collections: {},
    };
  }
}

/**
 * Graceful connection shutdown.
 */
export async function closeMongoDB(): Promise<void> {
  if (client) {
    console.log('[MongoDB Atlas] Closing connection pool...');
    await client.close();
    isConnected = false;
    dbInstance = null;
    client = null;
  }
}
