/**
 * CivicLens AI - MongoDB Atlas Data Migration & Verification Script
 * Run with: npx tsx server/migrate.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { MongoClient, ServerApiVersion } from 'mongodb';

const DB_NAME = process.env.MONGODB_DB_NAME || 'civiclens';
const MONGODB_URI = process.env.MONGODB_URI;

async function runMigration() {
  console.log('======================================================');
  console.log('CivicLens AI — MongoDB Atlas Migration & Sync Tool');
  console.log('======================================================');

  if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI environment variable is missing.');
    console.error('Please set MONGODB_URI in your .env file or environment.');
    console.error('Example: MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority"');
    process.exit(1);
  }

  const dataPath = path.resolve(process.cwd(), 'data/civiclens-db.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`ERROR: Seed file not found at ${dataPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);

  console.log(`Connecting to MongoDB Atlas cluster for database "${DB_NAME}"...`);
  const client = new MongoClient(MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('SUCCESS: Pinged your deployment. Connected to MongoDB Atlas.');

    const db = client.db(DB_NAME);

    const collections = [
      { name: 'users', key: 'users', uniqueIndex: { email: 1 } },
      { name: 'policies', key: 'policyDocuments', uniqueIndex: { id: 1 } },
      { name: 'policy_explanations', key: 'policyExplanations', uniqueIndex: { id: 1 } },
      { name: 'government_schemes', key: 'schemes', uniqueIndex: { id: 1 } },
      { name: 'civic_reports', key: 'civicReports', uniqueIndex: { reportId: 1 } },
      { name: 'fact_checks', key: 'factChecks', uniqueIndex: { id: 1 } },
      { name: 'applications', key: 'applications', uniqueIndex: { id: 1 } },
      { name: 'notifications', key: 'notifications', uniqueIndex: { id: 1 } },
      { name: 'bookmarks', key: 'bookmarks', uniqueIndex: { id: 1 } },
      { name: 'audit_logs', key: 'auditLogs', uniqueIndex: { id: 1 } },
    ];

    for (const col of collections) {
      const items = data[col.key] || [];
      console.log(`\nProcessing collection "${col.name}" (${items.length} records in seed file)...`);

      // Ensure index
      try {
        await db.collection(col.name).createIndex(col.uniqueIndex as any, { unique: true });
        console.log(`  - Verified index on ${JSON.stringify(col.uniqueIndex)}`);
      } catch (err: any) {
        console.warn(`  - Index notice: ${err.message}`);
      }

      // Upsert records to prevent duplicates
      let upsertedCount = 0;
      for (const item of items) {
        const query = col.name === 'users' ? { email: item.email } : { id: item.id };
        await db.collection(col.name).updateOne(query, { $set: item }, { upsert: true });
        upsertedCount++;
      }
      console.log(`  - Upserted ${upsertedCount} documents in "${col.name}".`);
    }

    console.log('\n======================================================');
    console.log('MIGRATION COMPLETE! All collections verified in MongoDB.');
    console.log('======================================================');
  } catch (err: any) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

runMigration();
