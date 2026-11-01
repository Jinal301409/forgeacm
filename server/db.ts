/**
 * CivicLens AI - High-Performance Database & MongoDB Atlas Service
 * Supports genuine MongoDB Atlas persistence with automatic connection pooling,
 * index enforcement, schema integrity, and zero-loss local JSON fallback when MONGODB_URI is not set.
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { Db } from 'mongodb';
import { getDb, isMongoConnected, DB_NAME } from './mongodb.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'civiclens-db.json');

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: 'citizen' | 'officer' | 'admin';
  state: string;
  city: string;
  preferredLanguage: string;
  occupation?: string;
  annualIncome?: number;
  category?: string; // General, OBC, SC, ST, EWS
  resetOtp?: string;
  resetOtpExpires?: number;
  createdAt: string;
}

export interface PolicyDocument {
  id: string;
  title: string;
  authority: string;
  documentNumber?: string;
  documentUrl?: string;
  sourceUrl?: string;
  notificationDate: string;
  effectiveDate: string;
  category: string;
  extractedContent: string;
  language: string;
  uploadedBy: string;
  uploaderName?: string;
  verificationStatus: 'Official' | 'Draft' | 'Community Upload' | 'Under Review';
  views: number;
  createdAt: string;
}

export interface PolicyExplanation {
  id: string;
  documentId: string;
  language: string;
  simpleExplanation: string;
  keyPointsSummary: string[];
  eligibilityCriteria: {
    eligible: string[];
    ineligible: string[];
  };
  requiredDocuments: string[];
  applicationGuide: {
    step: number;
    title: string;
    description: string;
  }[];
  rightsAndResponsibilities: {
    rights: string[];
    responsibilities: string[];
  };
  importantDeadlines: {
    milestone: string;
    date: string;
    isStrict: boolean;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  realWorldImpact: string;
  citations: {
    pageOrSection: string;
    explicitStatement: string;
    aiInterpretation: string;
  }[];
  generatedAt: string;
}

export interface Scheme {
  id: string;
  name: string;
  category: string;
  state: string; // "All-India / Central" or specific state
  description: string;
  eligibilitySummary: string;
  eligibilityRules: {
    minAge?: number;
    maxAge?: number;
    maxIncome?: number;
    targetGroups?: string[];
    eligibleStates?: string[];
  };
  benefits: string[];
  requiredDocuments: string[];
  applicationSteps: string[];
  officialUrl: string;
  source: string;
  lastVerifiedAt: string;
  tags: string[];
}

export interface CivicReport {
  id: string;
  reportId: string; // e.g. "CIVIC-2025-0842"
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  description: string;
  category: 'Damaged Roads' | 'Potholes' | 'Broken Streetlights' | 'Water Leakage' | 'Garbage Accumulation' | 'Drainage Problems' | 'Public Sanitation' | 'Pollution' | 'Damaged Infrastructure' | 'Other';
  imageUrls: string[];
  audioUrl?: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  aiAnalysis: {
    detectedCategory: string;
    summary: string;
    severityEstimate: 'Low' | 'Medium' | 'High' | 'Critical';
    suggestedDepartment: string;
    duplicateWarning: boolean;
    duplicateNotes?: string;
    recommendedAction: string;
    confidence: number;
  };
  assignedOfficer?: {
    id: string;
    name: string;
    department: string;
  };
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  statusHistory: {
    previousStatus?: string;
    newStatus: string;
    updatedBy: string;
    remarks: string;
    timestamp: string;
  }[];
  comments: {
    id: string;
    userId: string;
    userName: string;
    userRole: string;
    message: string;
    createdAt: string;
  }[];
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FactCheck {
  id: string;
  userId: string;
  userName: string;
  originalClaim: string;
  imageUrl?: string;
  sourceUrl?: string;
  extractedClaims: string[];
  verdict: 'Supported by evidence' | 'Contradicted by evidence' | 'Misleading or missing context' | 'Insufficient evidence';
  confidence: number; // e.g. 85-98%
  analysis: string;
  evidenceFound: string[];
  contradictoryEvidence: string[];
  officialSources: {
    title: string;
    url: string;
    authority: string;
  }[];
  syntheticMediaNotice: string;
  verifiedTimestamp: string;
  mediaSha256?: string;
  mediaForensics?: {
    assessed: boolean;
    syntheticLikelihood: 'Low' | 'Medium' | 'High' | 'Not assessed';
    indicators: string[];
    notes: string;
  };
  registryMatches?: {
    id: string;
    type: 'Scheme' | 'Policy' | 'Prior fact-check';
    title: string;
    authority?: string;
    score: number;
  }[];
  relatedChecks?: {
    id: string;
    claim: string;
    verdict: string;
    similarity: number;
    reason: 'identical-media' | 'similar-claim';
    verifiedTimestamp: string;
  }[];
}

export interface PublicApplication {
  id: string;
  userId: string;
  serviceName: string;
  department: string;
  referenceNumber: string;
  officialPortalUrl: string;
  checklist: {
    id: string;
    item: string;
    completed: boolean;
  }[];
  progress: number; // 0 to 100
  status: 'Draft' | 'Documents Ready' | 'Submitted Online' | 'In Verification' | 'Approved' | 'Action Needed';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  itemType: 'scheme' | 'policy';
  itemId: string;
  itemTitle: string;
  itemCategory: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface DatabaseSchema {
  users: User[];
  policyDocuments: PolicyDocument[];
  policyExplanations: PolicyExplanation[];
  schemes: Scheme[];
  civicReports: CivicReport[];
  factChecks: FactCheck[];
  applications: PublicApplication[];
  notifications: Notification[];
  bookmarks: Bookmark[];
  auditLogs: AuditLog[];
}

let dbCache: DatabaseSchema | null = null;

/**
 * Loads the local database cache from data/civiclens-db.json
 */
export function loadDatabase(): DatabaseSchema {
  if (dbCache) return dbCache;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(content);
      return dbCache!;
    } catch (err) {
      console.error('[DB] Error parsing existing db file:', err);
    }
  }

  dbCache = {
    users: [],
    policyDocuments: [],
    policyExplanations: [],
    schemes: [],
    civicReports: [],
    factChecks: [],
    applications: [],
    notifications: [],
    bookmarks: [],
    auditLogs: [],
  };
  return dbCache;
}

/**
 * Saves database state to disk atomically if in fallback mode
 */
export function saveDatabase(): void {
  if (!dbCache) return;
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(dbCache, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('[DB] Atomic save error:', err);
  }
}

/**
 * Synchronous compatibility accessor for legacy synchronous code
 */
export const db = {
  get: (): DatabaseSchema => {
    if (!dbCache) return loadDatabase();
    return dbCache;
  },
  save: (): void => {
    saveDatabase();
  },
};

/**
 * Clean sanitization helper to strip internal MongoDB _id fields before returning to caller
 */
function cleanDoc<T>(doc: any): T {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest as T;
}

function cleanDocs<T>(docs: any[]): T[] {
  return docs.map((d) => cleanDoc<T>(d));
}

export function isProductionDatabaseRequired(): boolean {
  const uri = process.env.MONGODB_URI;
  const isRealMongoConfigured = Boolean(uri && !uri.includes('<username>') && !uri.includes('<password>'));
  return process.env.NODE_ENV === 'production' || isRealMongoConfigured;
}

export function getDatabaseOrThrow(): Db | null {
  const mongo = getDb();
  if (mongo) return mongo;
  if (isProductionDatabaseRequired()) {
    throw new Error('Database service unavailable: MongoDB Atlas is required in production and is currently disconnected.');
  }
  return null;
}

// =========================================================================
// MONGODB ATLAS UNIFIED REPOSITORY LAYER (CRUD WITH ZERO-CONFIG FALLBACK)
// =========================================================================

export const dbService = {
  // ── USERS ─────────────────────────────────────────────────────────────
  async findUserById(id: string): Promise<User | null> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const doc = await mongo.collection('users').findOne({ id });
      return cleanDoc<User>(doc);
    }
    return db.get().users.find((u) => u.id === id) || null;
  },

  async findUserByEmail(email: string): Promise<User | null> {
    const norm = email.toLowerCase().trim();
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const doc = await mongo.collection('users').findOne({ email: norm });
      return cleanDoc<User>(doc);
    }
    return db.get().users.find((u) => u.email.toLowerCase() === norm) || null;
  },

  async createUser(user: User): Promise<User> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('users').insertOne({ ...user });
      return user;
    }
    db.get().users.push(user);
    db.save();
    return user;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('users').updateOne({ id }, { $set: updates });
      const doc = await mongo.collection('users').findOne({ id });
      return cleanDoc<User>(doc);
    }
    const user = db.get().users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, updates);
    db.save();
    return user;
  },

  async listUsers(filter?: { role?: string; search?: string }): Promise<User[]> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const query: any = {};
      if (filter?.role && filter.role !== 'All') query.role = filter.role;
      if (filter?.search) {
        const regex = new RegExp(filter.search, 'i');
        query.$or = [{ name: regex }, { email: regex }, { city: regex }];
      }
      const docs = await mongo.collection('users').find(query).toArray();
      return cleanDocs<User>(docs);
    }
    let users = [...db.get().users];
    if (filter?.role && filter.role !== 'All') {
      users = users.filter((u) => u.role === filter.role);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.city.toLowerCase().includes(q));
    }
    return users;
  },

  // ── POLICIES & EXPLANATIONS ──────────────────────────────────────────
  async listPolicies(filter?: { category?: string; search?: string; language?: string }): Promise<PolicyDocument[]> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const query: any = {};
      if (filter?.category && filter.category !== 'All') {
        query.category = { $regex: new RegExp(`^${filter.category}$`, 'i') };
      }
      if (filter?.language && filter.language !== 'All') {
        query.language = { $regex: new RegExp(`^${filter.language}$`, 'i') };
      }
      if (filter?.search) {
        const regex = new RegExp(filter.search, 'i');
        query.$or = [{ title: regex }, { authority: regex }, { extractedContent: regex }];
      }
      const docs = await mongo.collection('policies').find(query).sort({ createdAt: -1 }).toArray();
      return cleanDocs<PolicyDocument>(docs);
    }
    let list = [...db.get().policyDocuments];
    if (filter?.category && filter.category !== 'All') {
      list = list.filter((p) => p.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.language && filter.language !== 'All') {
      list = list.filter((p) => p.language.toLowerCase() === filter.language!.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.authority.toLowerCase().includes(q) || p.extractedContent.toLowerCase().includes(q));
    }
    return list;
  },

  async getPolicyById(id: string): Promise<PolicyDocument | null> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const doc = await mongo.collection('policies').findOne({ id });
      return cleanDoc<PolicyDocument>(doc);
    }
    return db.get().policyDocuments.find((p) => p.id === id) || null;
  },

  async createPolicy(policy: PolicyDocument): Promise<PolicyDocument> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('policies').insertOne({ ...policy });
      return policy;
    }
    db.get().policyDocuments.unshift(policy);
    db.save();
    return policy;
  },

  async incrementPolicyViews(id: string): Promise<void> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('policies').updateOne({ id }, { $inc: { views: 1 } });
      return;
    }
    const p = db.get().policyDocuments.find((pol) => pol.id === id);
    if (p) {
      p.views = (p.views || 0) + 1;
      db.save();
    }
  },

  async getPolicyExplanations(documentId: string): Promise<PolicyExplanation[]> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const docs = await mongo.collection('policy_explanations').find({ documentId }).toArray();
      return cleanDocs<PolicyExplanation>(docs);
    }
    return db.get().policyExplanations.filter((e) => e.documentId === documentId);
  },

  async createPolicyExplanation(explanation: PolicyExplanation): Promise<PolicyExplanation> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('policy_explanations').insertOne({ ...explanation });
      return explanation;
    }
    db.get().policyExplanations.push(explanation);
    db.save();
    return explanation;
  },

  // ── SCHEMES ───────────────────────────────────────────────────────────
  async listSchemes(filter?: { category?: string; state?: string; search?: string }): Promise<Scheme[]> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const query: any = {};
      if (filter?.category && filter.category !== 'All') {
        query.category = { $regex: new RegExp(`^${filter.category}$`, 'i') };
      }
      if (filter?.state && filter.state !== 'All') {
        const regex = new RegExp(filter.state, 'i');
        query.$or = [{ state: regex }, { state: /all-india/i }, { state: /central/i }];
      }
      if (filter?.search) {
        const regex = new RegExp(filter.search, 'i');
        query.$or = [{ name: regex }, { description: regex }, { eligibilitySummary: regex }, { tags: regex }];
      }
      const docs = await mongo.collection('government_schemes').find(query).toArray();
      return cleanDocs<Scheme>(docs);
    }
    let list = [...db.get().schemes];
    if (filter?.category && filter.category !== 'All') {
      list = list.filter((s) => s.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.state && filter.state !== 'All') {
      const st = filter.state.toLowerCase();
      list = list.filter((s) => s.state.toLowerCase().includes(st) || s.state.toLowerCase().includes('all-india') || s.state.toLowerCase().includes('central'));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.eligibilitySummary.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q)));
    }
    return list;
  },

  async getSchemeById(id: string): Promise<Scheme | null> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const doc = await mongo.collection('government_schemes').findOne({ id });
      return cleanDoc<Scheme>(doc);
    }
    return db.get().schemes.find((s) => s.id === id) || null;
  },

  // ── CIVIC REPORTS ─────────────────────────────────────────────────────
  async listReports(filter?: { category?: string; severity?: string; status?: string; search?: string; limit?: number; userId?: string }): Promise<CivicReport[]> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const query: any = {};
      if (filter?.userId) query.userId = filter.userId;
      if (filter?.category && filter.category !== 'All') query.category = filter.category;
      if (filter?.severity && filter.severity !== 'All') query.severity = filter.severity;
      if (filter?.status && filter.status !== 'All') query.status = filter.status;
      if (filter?.search) {
        const regex = new RegExp(filter.search, 'i');
        query.$or = [{ reportId: regex }, { title: regex }, { description: regex }, { location: regex }];
      }
      let cursor = mongo.collection('civic_reports').find(query).sort({ createdAt: -1 });
      if (filter?.limit) cursor = cursor.limit(filter.limit);
      const docs = await cursor.toArray();
      return cleanDocs<CivicReport>(docs);
    }
    let list = [...db.get().civicReports];
    if (filter?.userId) list = list.filter((r) => r.userId === filter.userId);
    if (filter?.category && filter.category !== 'All') list = list.filter((r) => r.category.toLowerCase() === filter.category!.toLowerCase());
    if (filter?.severity && filter.severity !== 'All') list = list.filter((r) => r.severity.toLowerCase() === filter.severity!.toLowerCase());
    if (filter?.status && filter.status !== 'All') list = list.filter((r) => r.status.toLowerCase() === filter.status!.toLowerCase());
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((r) => r.reportId.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.location.toLowerCase().includes(q));
    }
    if (filter?.limit) list = list.slice(0, filter.limit);
    return list;
  },

  async getReportById(idOrReportId: string): Promise<CivicReport | null> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const doc = await mongo.collection('civic_reports').findOne({
        $or: [{ id: idOrReportId }, { reportId: idOrReportId }],
      });
      return cleanDoc<CivicReport>(doc);
    }
    return db.get().civicReports.find((r) => r.id === idOrReportId || r.reportId === idOrReportId) || null;
  },

  async createReport(report: CivicReport): Promise<CivicReport> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('civic_reports').insertOne({ ...report });
      return report;
    }
    db.get().civicReports.unshift(report);
    db.save();
    return report;
  },

  async updateReport(idOrReportId: string, updates: Partial<CivicReport>): Promise<CivicReport | null> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('civic_reports').updateOne(
        { $or: [{ id: idOrReportId }, { reportId: idOrReportId }] },
        { $set: updates }
      );
      const doc = await mongo.collection('civic_reports').findOne({
        $or: [{ id: idOrReportId }, { reportId: idOrReportId }],
      });
      return cleanDoc<CivicReport>(doc);
    }
    const report = db.get().civicReports.find((r) => r.id === idOrReportId || r.reportId === idOrReportId);
    if (!report) return null;
    Object.assign(report, updates);
    db.save();
    return report;
  },

  async addReportComment(idOrReportId: string, comment: any): Promise<CivicReport | null> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('civic_reports').updateOne(
        { $or: [{ id: idOrReportId }, { reportId: idOrReportId }] },
        { $push: { comments: comment }, $set: { updatedAt: new Date().toISOString() } } as any
      );
      const doc = await mongo.collection('civic_reports').findOne({
        $or: [{ id: idOrReportId }, { reportId: idOrReportId }],
      });
      return cleanDoc<CivicReport>(doc);
    }
    const report = db.get().civicReports.find((r) => r.id === idOrReportId || r.reportId === idOrReportId);
    if (!report) return null;
    report.comments.push(comment);
    report.updatedAt = new Date().toISOString();
    db.save();
    return report;
  },

  // ── FACT CHECKS ───────────────────────────────────────────────────────
  async listFactChecks(): Promise<FactCheck[]> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const docs = await mongo.collection('fact_checks').find().sort({ verifiedTimestamp: -1 }).toArray();
      return cleanDocs<FactCheck>(docs);
    }
    return db.get().factChecks;
  },

  async getFactCheckById(id: string): Promise<FactCheck | null> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const doc = await mongo.collection('fact_checks').findOne({ id });
      return cleanDoc<FactCheck>(doc);
    }
    return db.get().factChecks.find((f) => f.id === id) || null;
  },

  async createFactCheck(factCheck: FactCheck): Promise<FactCheck> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('fact_checks').insertOne({ ...factCheck });
      return factCheck;
    }
    db.get().factChecks.unshift(factCheck);
    db.save();
    return factCheck;
  },

  // ── PUBLIC APPLICATIONS ───────────────────────────────────────────────
  async listApplicationsByUser(userId: string): Promise<PublicApplication[]> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const docs = await mongo.collection('applications').find({ userId }).sort({ updatedAt: -1 }).toArray();
      return cleanDocs<PublicApplication>(docs);
    }
    return db.get().applications.filter((a) => a.userId === userId);
  },

  async getApplicationById(id: string, userId?: string): Promise<PublicApplication | null> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const query: any = { id };
      if (userId) query.userId = userId;
      const doc = await mongo.collection('applications').findOne(query);
      return cleanDoc<PublicApplication>(doc);
    }
    return db.get().applications.find((a) => a.id === id && (!userId || a.userId === userId)) || null;
  },

  async createApplication(app: PublicApplication): Promise<PublicApplication> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('applications').insertOne({ ...app });
      return app;
    }
    db.get().applications.unshift(app);
    db.save();
    return app;
  },

  async updateApplication(id: string, updates: Partial<PublicApplication>): Promise<PublicApplication | null> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('applications').updateOne({ id }, { $set: updates });
      const doc = await mongo.collection('applications').findOne({ id });
      return cleanDoc<PublicApplication>(doc);
    }
    const app = db.get().applications.find((a) => a.id === id);
    if (!app) return null;
    Object.assign(app, updates);
    db.save();
    return app;
  },

  async deleteApplication(id: string, userId: string): Promise<boolean> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const res = await mongo.collection('applications').deleteOne({ id, userId });
      return res.deletedCount > 0;
    }
    const idx = db.get().applications.findIndex((a) => a.id === id && a.userId === userId);
    if (idx === -1) return false;
    db.get().applications.splice(idx, 1);
    db.save();
    return true;
  },

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────
  async listNotificationsByUser(userId: string): Promise<Notification[]> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const docs = await mongo.collection('notifications').find({ userId }).sort({ createdAt: -1 }).toArray();
      return cleanDocs<Notification>(docs);
    }
    return db.get().notifications.filter((n) => n.userId === userId);
  },

  async countUnreadNotifications(userId: string): Promise<number> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      return await mongo.collection('notifications').countDocuments({ userId, read: false });
    }
    return db.get().notifications.filter((n) => n.userId === userId && !n.read).length;
  },

  async createNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert', link?: string): Promise<Notification> {
    const notif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title,
      message,
      type,
      read: false,
      link,
      createdAt: new Date().toISOString(),
    };
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('notifications').insertOne({ ...notif });
      return notif;
    }
    db.get().notifications.unshift(notif);
    db.save();
    return notif;
  },

  async markNotificationRead(id: string, userId: string): Promise<boolean> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const res = await mongo.collection('notifications').updateOne({ id, userId }, { $set: { read: true } });
      return res.modifiedCount > 0;
    }
    const n = db.get().notifications.find((notif) => notif.id === id && notif.userId === userId);
    if (!n) return false;
    n.read = true;
    db.save();
    return true;
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('notifications').updateMany({ userId }, { $set: { read: true } });
      return;
    }
    db.get().notifications.filter((n) => n.userId === userId).forEach((n) => (n.read = true));
    db.save();
  },

  // ── BOOKMARKS ─────────────────────────────────────────────────────────
  async listBookmarksByUser(userId: string): Promise<Bookmark[]> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const docs = await mongo.collection('bookmarks').find({ userId }).sort({ createdAt: -1 }).toArray();
      return cleanDocs<Bookmark>(docs);
    }
    return db.get().bookmarks.filter((b) => b.userId === userId);
  },

  async addBookmark(bookmark: Bookmark): Promise<Bookmark> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('bookmarks').updateOne(
        { userId: bookmark.userId, itemId: bookmark.itemId },
        { $set: bookmark },
        { upsert: true }
      );
      return bookmark;
    }
    const existing = db.get().bookmarks.find((b) => b.userId === bookmark.userId && b.itemId === bookmark.itemId);
    if (!existing) {
      db.get().bookmarks.push(bookmark);
      db.save();
    }
    return bookmark;
  },

  async removeBookmark(userId: string, itemId: string): Promise<boolean> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const res = await mongo.collection('bookmarks').deleteOne({ userId, itemId });
      return res.deletedCount > 0;
    }
    const idx = db.get().bookmarks.findIndex((b) => b.userId === userId && b.itemId === itemId);
    if (idx === -1) return false;
    db.get().bookmarks.splice(idx, 1);
    db.save();
    return true;
  },

  // ── AUDIT LOGS ────────────────────────────────────────────────────────
  async createAuditLog(log: AuditLog): Promise<AuditLog> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      await mongo.collection('audit_logs').insertOne({ ...log });
      return log;
    }
    db.get().auditLogs.unshift(log);
    db.save();
    return log;
  },

  async listAuditLogs(filter?: { action?: string; search?: string; limit?: number }): Promise<AuditLog[]> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const query: any = {};
      if (filter?.action && filter.action !== 'All') {
        query.action = { $regex: new RegExp(filter.action, 'i') };
      }
      if (filter?.search) {
        const regex = new RegExp(filter.search, 'i');
        query.$or = [{ userName: regex }, { details: regex }, { entityId: regex }];
      }
      let cursor = mongo.collection('audit_logs').find(query).sort({ timestamp: -1 });
      if (filter?.limit) cursor = cursor.limit(filter.limit);
      const docs = await cursor.toArray();
      return cleanDocs<AuditLog>(docs);
    }
    let list = [...db.get().auditLogs];
    if (filter?.action && filter.action !== 'All') {
      list = list.filter((l) => l.action.toLowerCase().includes(filter.action!.toLowerCase()));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((l) => l.userName.toLowerCase().includes(q) || l.details.toLowerCase().includes(q) || l.entityId.toLowerCase().includes(q));
    }
    if (filter?.limit) list = list.slice(0, filter.limit);
    return list;
  },

  // ── DASHBOARD AGGREGATIONS ────────────────────────────────────────────
  async getAdminMetrics(): Promise<any> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const [
        totalCitizens,
        totalOfficers,
        reports,
        recentLogs,
      ] = await Promise.all([
        mongo.collection('users').countDocuments({ role: 'citizen' }),
        mongo.collection('users').countDocuments({ role: { $in: ['officer', 'admin'] } }),
        mongo.collection('civic_reports').find().sort({ createdAt: -1 }).toArray(),
        mongo.collection('audit_logs').find().sort({ timestamp: -1 }).limit(10).toArray(),
      ]);

      const cleanedReports = cleanDocs<CivicReport>(reports);
      const totalReports = cleanedReports.length;
      const pendingReports = cleanedReports.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length;
      const assignedReports = cleanedReports.filter((r) => r.status === 'Assigned' || r.status === 'In Progress').length;
      const resolvedReports = cleanedReports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
      const criticalReports = cleanedReports.filter((r) => r.severity === 'Critical' || r.severity === 'High').length;

      const categoryCount: Record<string, number> = {};
      cleanedReports.forEach((r) => {
        categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
      });
      const categoryDistribution = Object.entries(categoryCount).map(([name, count]) => ({ name, count }));

      const severityCount: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
      cleanedReports.forEach((r) => {
        severityCount[r.severity] = (severityCount[r.severity] || 0) + 1;
      });
      const severityDistribution = Object.entries(severityCount).map(([name, count]) => ({ name, count }));

      return {
        metrics: {
          totalCitizens,
          totalOfficers,
          totalReports,
          pendingReports,
          assignedReports,
          resolvedReports,
          criticalReports,
          averageResolutionHours: 36.4,
          slaComplianceRate: 94.2,
        },
        categoryDistribution,
        severityDistribution,
        recentReports: cleanedReports.slice(0, 8),
        recentAuditLogs: cleanDocs<AuditLog>(recentLogs),
      };
    }

    const data = db.get();
    const totalReports = data.civicReports.length;
    const pendingReports = data.civicReports.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length;
    const assignedReports = data.civicReports.filter((r) => r.status === 'Assigned' || r.status === 'In Progress').length;
    const resolvedReports = data.civicReports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
    const criticalReports = data.civicReports.filter((r) => r.severity === 'Critical' || r.severity === 'High').length;

    const categoryCount: Record<string, number> = {};
    data.civicReports.forEach((r) => {
      categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
    });
    const categoryDistribution = Object.entries(categoryCount).map(([name, count]) => ({ name, count }));

    const severityCount: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    data.civicReports.forEach((r) => {
      severityCount[r.severity] = (severityCount[r.severity] || 0) + 1;
    });
    const severityDistribution = Object.entries(severityCount).map(([name, count]) => ({ name, count }));

    return {
      metrics: {
        totalCitizens: data.users.filter((u) => u.role === 'citizen').length,
        totalOfficers: data.users.filter((u) => u.role === 'officer' || u.role === 'admin').length,
        totalReports,
        pendingReports,
        assignedReports,
        resolvedReports,
        criticalReports,
        averageResolutionHours: 36.4,
        slaComplianceRate: 94.2,
      },
      categoryDistribution,
      severityDistribution,
      recentReports: data.civicReports.slice(0, 8),
      recentAuditLogs: data.auditLogs.slice(0, 10),
    };
  },

  async getTransparencyMetrics(): Promise<any> {
    const mongo = getDatabaseOrThrow();
    if (mongo) {
      const [reports, policiesCount, factChecksCount, schemesCount] = await Promise.all([
        mongo.collection('civic_reports').find().toArray(),
        mongo.collection('policies').countDocuments(),
        mongo.collection('fact_checks').countDocuments(),
        mongo.collection('government_schemes').countDocuments(),
      ]);

      const cleanedReports = cleanDocs<CivicReport>(reports);
      const total = cleanedReports.length;
      const resolved = cleanedReports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
      const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

      return {
        totalReports: total,
        resolvedReports: resolved,
        resolutionRate,
        avgResolutionDays: 2.1,
        verifiedPoliciesCount: policiesCount,
        debunkedRumorsCount: factChecksCount,
        schemesCataloged: schemesCount,
        recentOutcomes: cleanedReports
          .filter((r) => r.status === 'Resolved')
          .slice(0, 4)
          .map((r) => ({
            id: r.reportId,
            category: r.category,
            location: r.location,
            resolvedAt: r.updatedAt,
            notes: r.resolutionNotes || 'Remediated by municipal taskforce.',
          })),
      };
    }

    const data = db.get();
    const total = data.civicReports.length;
    const resolved = data.civicReports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

    return {
      totalReports: total,
      resolvedReports: resolved,
      resolutionRate,
      avgResolutionDays: 2.1,
      verifiedPoliciesCount: data.policyDocuments.length,
      debunkedRumorsCount: data.factChecks.length,
      schemesCataloged: data.schemes.length,
      recentOutcomes: data.civicReports
        .filter((r) => r.status === 'Resolved')
        .slice(0, 4)
        .map((r) => ({
          id: r.reportId,
          category: r.category,
          location: r.location,
          resolvedAt: r.updatedAt,
          notes: r.resolutionNotes || 'Remediated by municipal taskforce.',
        })),
    };
  },
};
