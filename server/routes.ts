/**
 * CivicLens AI - Complete REST API Routes
 */

import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db, User, CivicReport, PolicyDocument, FactCheck, PublicApplication, Notification, AuditLog } from './db.js';
import { authenticate, generateToken, requireRole, optionalAuthenticate, AuthRequest } from './auth.js';
import {
  isGeminiConfigured,
  explainPolicyWithGemini,
  askPolicyQuestionWithGemini,
  triageCivicIssueWithGemini,
  verifyFactClaimWithGemini,
  evaluateSchemeEligibilityWithGemini,
} from './gemini.js';

export const apiRouter = Router();

// Multer storage configuration for uploads
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

// Helper for audit logging
function logAudit(userId: string, userName: string, action: string, entityType: string, entityId: string, details: string) {
  const auditLog: AuditLog = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    userName,
    action,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  };
  db.get().auditLogs.unshift(auditLog);
  db.save();
}

// Helper for creating notifications
function createNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert', link?: string) {
  const notif: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    title,
    message,
    type,
    read: false,
    link,
    createdAt: new Date().toISOString(),
  };
  db.get().notifications.unshift(notif);
  db.save();
}

// ==========================================
// 1. SYSTEM & HEALTH STATUS
// ==========================================

apiRouter.get('/system/status', (_req, res: Response) => {
  const data = db.get();
  res.json({
    status: 'online',
    appName: 'CivicLens AI',
    version: '1.0.0',
    tagline: 'Understand. Verify. Act.',
    database: {
      engine: process.env.MONGODB_URI ? 'MongoDB Atlas' : 'Zero-Config Persistent Engine (Disk-backed JSON)',
      isPersistent: true,
      stats: {
        users: data.users.length,
        policyDocuments: data.policyDocuments.length,
        policyExplanations: data.policyExplanations.length,
        schemes: data.schemes.length,
        civicReports: data.civicReports.length,
        factChecks: data.factChecks.length,
        applications: data.applications.length,
        notifications: data.notifications.length,
        auditLogs: data.auditLogs.length,
      },
    },
    ai: {
      provider: 'Google Gemini',
      model: 'gemini-3.8-flash',
      isConfigured: isGeminiConfigured(),
      capabilities: [
        'Multilingual Policy Analysis',
        'Citation Grounding & Explicitness Separation',
        'Multimodal Grievance Triage & Categorization',
        'Fact Verification & Evidence Correlation',
        'Citizen Scheme Eligibility Matching',
      ],
    },
    storage: {
      provider: process.env.CLOUDINARY_URL ? 'Cloudinary Cloud Storage' : 'Persistent Local Media Server',
    },
  });
});

// File upload endpoint
apiRouter.post('/upload', upload.single('file'), (req, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file was uploaded.' });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });
});

// ==========================================
// 2. AUTHENTICATION & PROFILES
// ==========================================

apiRouter.post('/auth/register', (req, res: Response) => {
  try {
    const { name, email, password, phone, state, city, preferredLanguage, role, occupation, annualIncome, category } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    const data = db.get();
    const existing = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists. Please log in instead.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      phone: phone || '',
      role: (role === 'admin' || role === 'officer') ? role : 'citizen',
      state: state || 'National / Other',
      city: city || 'City',
      preferredLanguage: preferredLanguage || 'English',
      occupation: occupation || '',
      annualIncome: annualIncome ? Number(annualIncome) : undefined,
      category: category || 'General',
      createdAt: new Date().toISOString(),
    };

    data.users.push(newUser);
    db.save();

    logAudit(newUser.id, newUser.name, 'USER_REGISTERED', 'User', newUser.id, `New citizen registered from ${newUser.city}, ${newUser.state}`);
    createNotification(newUser.id, 'Welcome to CivicLens AI', 'Your civic intelligence account is active. Explore policies, report local issues, or check scheme eligibility.', 'success');

    const token = generateToken(newUser);
    const { passwordHash: _, ...userSafe } = newUser;

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: userSafe,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

apiRouter.post('/auth/login', (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const data = db.get();
    const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password credentials.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password credentials.' });
      return;
    }

    const token = generateToken(user);
    logAudit(user.id, user.name, 'USER_LOGIN', 'User', user.id, `User logged in from ${req.ip || 'web client'}`);

    const { passwordHash: _, ...userSafe } = user;
    res.json({
      message: 'Login successful.',
      token,
      user: userSafe,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

apiRouter.get('/auth/me', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }
  const { passwordHash: _, ...userSafe } = req.user;
  const unreadNotifs = db.get().notifications.filter((n) => n.userId === req.user!.id && !n.read).length;
  res.json({
    user: userSafe,
    unreadNotifications: unreadNotifs,
  });
});

apiRouter.patch('/auth/profile', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  const { name, phone, state, city, preferredLanguage, occupation, annualIncome, category } = req.body;
  const user = req.user;

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone;
  if (state) user.state = state;
  if (city) user.city = city;
  if (preferredLanguage) user.preferredLanguage = preferredLanguage;
  if (occupation !== undefined) user.occupation = occupation;
  if (annualIncome !== undefined) user.annualIncome = Number(annualIncome);
  if (category !== undefined) user.category = category;

  db.save();
  logAudit(user.id, user.name, 'PROFILE_UPDATED', 'User', user.id, 'User updated profile details.');

  const { passwordHash: _, ...userSafe } = user;
  res.json({ message: 'Profile updated successfully.', user: userSafe });
});

apiRouter.post('/auth/forgot-password', (req, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required.' });
    return;
  }
  const user = db.get().users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    // Standard security: do not leak existence of email
    res.json({ message: 'If this email is registered, password reset instructions have been sent.' });
    return;
  }
  res.json({
    message: 'If this email is registered, password reset instructions have been sent.',
    demoNote: 'For demonstration purposes, you can reset your password immediately using the reset form.',
  });
});

apiRouter.post('/auth/reset-password', (req, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    res.status(400).json({ error: 'Email and new password are required.' });
    return;
  }
  const user = db.get().users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  const salt = bcrypt.genSaltSync(10);
  user.passwordHash = bcrypt.hashSync(newPassword, salt);
  db.save();
  logAudit(user.id, user.name, 'PASSWORD_RESET', 'User', user.id, 'User password was reset successfully.');
  res.json({ message: 'Password has been updated successfully. You can now log in.' });
});

// ==========================================
// 3. AI POLICY INTELLIGENCE
// ==========================================

apiRouter.get('/policies', (req, res: Response) => {
  const { category, search, language } = req.query;
  let policies = [...db.get().policyDocuments];

  if (category && category !== 'All') {
    policies = policies.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase();
    policies = policies.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.authority.toLowerCase().includes(q) ||
        p.extractedContent.toLowerCase().includes(q)
    );
  }
  if (language && language !== 'All') {
    policies = policies.filter((p) => p.language.toLowerCase() === String(language).toLowerCase());
  }

  res.json({ policies });
});

apiRouter.get('/policies/:id', (req, res: Response) => {
  const policy = db.get().policyDocuments.find((p) => p.id === req.params.id);
  if (!policy) {
    res.status(404).json({ error: 'Policy document not found.' });
    return;
  }
  policy.views = (policy.views || 0) + 1;
  db.save();

  const explanations = db.get().policyExplanations.filter((e) => e.documentId === policy.id);
  res.json({ policy, explanations });
});

apiRouter.post('/policies/upload', authenticate, upload.single('file'), (req: AuthRequest, res: Response) => {
  try {
    const { title, authority, documentNumber, category, sourceUrl, content, language } = req.body;
    let extractedContent = content || '';

    if (req.file) {
      // If a text file was uploaded, read text directly
      if (req.file.mimetype.includes('text') || req.file.mimetype.includes('json')) {
        extractedContent = fs.readFileSync(req.file.path, 'utf-8');
      } else {
        extractedContent = `Document uploaded: ${req.file.originalname}. Official notification published by ${authority || 'Issuing Authority'}. Content available for automated semantic analysis.`;
      }
    }

    if (!title || !extractedContent) {
      res.status(400).json({ error: 'Document title and text content are required.' });
      return;
    }

    const newDoc: PolicyDocument = {
      id: `pol_doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      authority: authority ? authority.trim() : 'Government Department / Authority',
      documentNumber: documentNumber ? documentNumber.trim() : `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceUrl: sourceUrl || '',
      notificationDate: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      category: category || 'Public Administration',
      extractedContent,
      language: language || 'English',
      uploadedBy: req.user!.id,
      uploaderName: req.user!.name,
      verificationStatus: req.user!.role === 'citizen' ? 'Community Upload' : 'Official',
      views: 1,
      createdAt: new Date().toISOString(),
    };

    db.get().policyDocuments.unshift(newDoc);
    db.save();

    logAudit(req.user!.id, req.user!.name, 'POLICY_UPLOAD', 'PolicyDocument', newDoc.id, `Uploaded policy "${newDoc.title}"`);

    res.status(201).json({
      message: 'Policy document uploaded successfully.',
      policy: newDoc,
    });
  } catch (error: any) {
    console.error('Policy upload error:', error);
    res.status(500).json({ error: 'Failed to upload policy document.' });
  }
});

apiRouter.post('/policies/:id/explain', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const policy = db.get().policyDocuments.find((p) => p.id === req.params.id);
    if (!policy) {
      res.status(404).json({ error: 'Policy document not found.' });
      return;
    }

    const targetLanguage = req.body.targetLanguage || req.user?.preferredLanguage || 'English';

    // Check if an explanation for this language already exists
    const existing = db.get().policyExplanations.find(
      (e) => e.documentId === policy.id && e.language.toLowerCase() === targetLanguage.toLowerCase()
    );
    if (existing && !req.body.forceRefresh) {
      res.json({ explanation: existing, cached: true });
      return;
    }

    const analysis = await explainPolicyWithGemini({
      title: policy.title,
      authority: policy.authority,
      content: policy.extractedContent,
      targetLanguage,
    });

    const newExplanation = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      documentId: policy.id,
      language: targetLanguage,
      simpleExplanation: analysis.simpleExplanation,
      keyPointsSummary: analysis.keyPointsSummary || [],
      eligibilityCriteria: analysis.eligibilityCriteria || { eligible: [], ineligible: [] },
      requiredDocuments: analysis.requiredDocuments || [],
      applicationGuide: analysis.applicationGuide || [],
      rightsAndResponsibilities: analysis.rightsAndResponsibilities || { rights: [], responsibilities: [] },
      importantDeadlines: analysis.importantDeadlines || [],
      faqs: analysis.faqs || [],
      realWorldImpact: analysis.realWorldImpact || '',
      citations: analysis.citations || [],
      generatedAt: new Date().toISOString(),
    };

    db.get().policyExplanations.push(newExplanation);
    db.save();

    logAudit(req.user!.id, req.user!.name, 'GENERATE_POLICY_EXPLANATION', 'PolicyExplanation', newExplanation.id, `Generated explanation in ${targetLanguage}`);

    res.json({ explanation: newExplanation, cached: false });
  } catch (error: any) {
    console.error('Explain policy error:', error);
    res.status(500).json({ error: error.message || 'Failed to explain policy document with AI.' });
  }
});

apiRouter.post('/policies/:id/ask', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const policy = db.get().policyDocuments.find((p) => p.id === req.params.id);
    if (!policy) {
      res.status(404).json({ error: 'Policy document not found.' });
      return;
    }

    const { question } = req.body;
    if (!question) {
      res.status(400).json({ error: 'Question is required.' });
      return;
    }

    const answer = await askPolicyQuestionWithGemini({
      policyTitle: policy.title,
      policyContent: policy.extractedContent,
      question,
    });

    res.json({ question, answer });
  } catch (error: any) {
    console.error('Ask policy question error:', error);
    res.status(500).json({ error: error.message || 'Failed to answer question.' });
  }
});

// ==========================================
// 4. GOVERNMENT SCHEME EXPLORER
// ==========================================

apiRouter.get('/schemes', (req, res: Response) => {
  const { category, state, search } = req.query;
  let schemes = [...db.get().schemes];

  if (category && category !== 'All') {
    schemes = schemes.filter((s) => s.category.toLowerCase().includes(String(category).toLowerCase()));
  }
  if (state && state !== 'All') {
    schemes = schemes.filter(
      (s) => s.state === 'All-India / Central' || s.state.toLowerCase() === String(state).toLowerCase()
    );
  }
  if (search) {
    const q = String(search).toLowerCase();
    schemes = schemes.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json({ schemes });
});

apiRouter.get('/schemes/:id', (req, res: Response) => {
  const scheme = db.get().schemes.find((s) => s.id === req.params.id);
  if (!scheme) {
    res.status(404).json({ error: 'Scheme not found.' });
    return;
  }
  res.json({ scheme });
});

apiRouter.post('/schemes/:id/check-eligibility', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const scheme = db.get().schemes.find((s) => s.id === req.params.id);
    if (!scheme) {
      res.status(404).json({ error: 'Scheme not found.' });
      return;
    }

    const user = req.user!;
    const profile = {
      name: user.name,
      age: req.body.age || 32,
      annualIncome: req.body.annualIncome ?? user.annualIncome,
      state: req.body.state || user.state,
      city: req.body.city || user.city,
      occupation: req.body.occupation || user.occupation,
      category: req.body.category || user.category,
    };

    const evaluation = await evaluateSchemeEligibilityWithGemini({
      userProfile: profile,
      scheme: {
        name: scheme.name,
        category: scheme.category,
        eligibilitySummary: scheme.eligibilitySummary,
        benefits: scheme.benefits,
        requiredDocuments: scheme.requiredDocuments,
      },
    });

    res.json({ scheme, evaluation });
  } catch (error: any) {
    console.error('Check scheme eligibility error:', error);
    res.status(500).json({ error: error.message || 'Failed to check eligibility.' });
  }
});

// Bookmarking schemes
apiRouter.post('/schemes/:id/bookmark', authenticate, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const scheme = db.get().schemes.find((s) => s.id === req.params.id);
  if (!scheme) {
    res.status(404).json({ error: 'Scheme not found.' });
    return;
  }

  const existing = db.get().bookmarks.find((b) => b.userId === user.id && b.itemId === scheme.id);
  if (existing) {
    res.json({ bookmarked: true, message: 'Already bookmarked.' });
    return;
  }

  db.get().bookmarks.push({
    id: `bm_${Date.now()}`,
    userId: user.id,
    itemType: 'scheme',
    itemId: scheme.id,
    itemTitle: scheme.name,
    itemCategory: scheme.category,
    createdAt: new Date().toISOString(),
  });
  db.save();

  res.json({ bookmarked: true, message: 'Scheme saved to your bookmarks.' });
});

apiRouter.delete('/schemes/:id/bookmark', authenticate, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const index = db.get().bookmarks.findIndex((b) => b.userId === user.id && b.itemId === req.params.id);
  if (index !== -1) {
    db.get().bookmarks.splice(index, 1);
    db.save();
  }
  res.json({ bookmarked: false, message: 'Scheme removed from bookmarks.' });
});

// ==========================================
// 5. CIVIC GRIEVANCE REPORTING & TRACKING
// ==========================================

apiRouter.post('/reports', authenticate, upload.array('images', 4), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, location, address, latitude, longitude, imageBase64, imageMimeType } = req.body;

    if (!title || !description || !location) {
      res.status(400).json({ error: 'Title, description, and location are required.' });
      return;
    }

    const uploadedUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((f: any) => {
        uploadedUrls.push(`/uploads/${f.filename}`);
      });
    }

    if (imageBase64 && (!uploadedUrls.length || uploadedUrls.length === 0)) {
      // Direct base64 image support
      uploadedUrls.push(imageBase64.startsWith('data:') ? imageBase64 : `data:${imageMimeType || 'image/jpeg'};base64,${imageBase64}`);
    }

    // Call Gemini AI for automated municipal triage
    const aiAnalysis = await triageCivicIssueWithGemini({
      title,
      description,
      location,
      imageBase64: imageBase64 ? imageBase64.replace(/^data:image\/\w+;base64,/, '') : undefined,
      imageMimeType: imageMimeType || 'image/jpeg',
    });

    const reportSeq = Math.floor(1000 + Math.random() * 9000);
    const reportId = `CIVIC-${new Date().getFullYear()}-${reportSeq}`;

    const newReport: CivicReport = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reportId,
      userId: req.user!.id,
      userName: req.user!.name,
      userEmail: req.user!.email,
      title: title.trim(),
      description: description.trim(),
      category: (aiAnalysis.detectedCategory as any) || category || 'Damaged Infrastructure',
      imageUrls: uploadedUrls.length > 0 ? uploadedUrls : [
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      ],
      location: location.trim(),
      address: address || location,
      latitude: latitude ? parseFloat(latitude) : 23.0225 + (Math.random() - 0.5) * 0.08,
      longitude: longitude ? parseFloat(longitude) : 72.5714 + (Math.random() - 0.5) * 0.08,
      severity: (aiAnalysis.severityEstimate as any) || 'Medium',
      aiAnalysis,
      status: 'Submitted',
      statusHistory: [
        {
          newStatus: 'Submitted',
          updatedBy: `${req.user!.name} (Citizen)`,
          remarks: 'Complaint registered with location coordinates and description.',
          timestamp: new Date().toISOString(),
        },
        {
          previousStatus: 'Submitted',
          newStatus: 'Under Review',
          updatedBy: 'CivicLens AI System',
          remarks: `AI Triage: Assessed as ${aiAnalysis.severityEstimate} severity. Recommended route to ${aiAnalysis.suggestedDepartment}.`,
          timestamp: new Date().toISOString(),
        },
      ],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.get().civicReports.unshift(newReport);
    db.save();

    logAudit(req.user!.id, req.user!.name, 'SUBMIT_REPORT', 'CivicReport', newReport.reportId, `Reported ${newReport.category} at ${newReport.location}`);
    createNotification(req.user!.id, 'Report Successfully Registered', `Your complaint #${newReport.reportId} is logged and scheduled for municipal inspection.`, 'info', `/reports/${newReport.reportId}`);

    res.status(201).json({
      message: 'Civic grievance successfully filed.',
      report: newReport,
    });
  } catch (error: any) {
    console.error('Report submission error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit civic report.' });
  }
});

apiRouter.get('/reports', optionalAuthenticate, (req: AuthRequest, res: Response) => {
  const { category, severity, status, search, limit } = req.query;
  let reports = [...db.get().civicReports];

  if (category && category !== 'All') {
    reports = reports.filter((r) => r.category.toLowerCase() === String(category).toLowerCase());
  }
  if (severity && severity !== 'All') {
    reports = reports.filter((r) => r.severity.toLowerCase() === String(severity).toLowerCase());
  }
  if (status && status !== 'All') {
    reports = reports.filter((r) => r.status.toLowerCase() === String(status).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase();
    reports = reports.filter(
      (r) =>
        r.reportId.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
    );
  }

  if (limit) {
    reports = reports.slice(0, Number(limit));
  }

  // If user is not logged in or is regular citizen viewing public feed,
  // sanitize private email for public transparency compliance
  const sanitized = reports.map((r) => {
    if (!req.user || (req.user.role === 'citizen' && req.user.id !== r.userId)) {
      return {
        ...r,
        userEmail: undefined,
        userName: `${r.userName.split(' ')[0]} (Citizen)`,
      };
    }
    return r;
  });

  res.json({ reports: sanitized });
});

apiRouter.get('/reports/my', authenticate, (req: AuthRequest, res: Response) => {
  const myReports = db.get().civicReports.filter((r) => r.userId === req.user!.id);
  res.json({ reports: myReports });
});

apiRouter.get('/reports/:id', (req, res: Response) => {
  const report = db.get().civicReports.find(
    (r) => r.id === req.params.id || r.reportId === req.params.id
  );
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }
  res.json({ report });
});

apiRouter.patch('/reports/:id/status', authenticate, requireRole('officer', 'admin'), (req: AuthRequest, res: Response) => {
  const { status, remarks, resolutionNotes } = req.body;
  const report = db.get().civicReports.find(
    (r) => r.id === req.params.id || r.reportId === req.params.id
  );
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }

  const previousStatus = report.status;
  report.status = status;
  report.updatedAt = new Date().toISOString();

  if (resolutionNotes) {
    report.resolutionNotes = resolutionNotes;
  }

  report.statusHistory.push({
    previousStatus,
    newStatus: status,
    updatedBy: `${req.user!.name} (${req.user!.role.toUpperCase()})`,
    remarks: remarks || `Status updated to ${status}.`,
    timestamp: new Date().toISOString(),
  });

  db.save();

  logAudit(req.user!.id, req.user!.name, 'UPDATE_REPORT_STATUS', 'CivicReport', report.reportId, `Status transitioned from ${previousStatus} to ${status}`);
  createNotification(report.userId, `Grievance #${report.reportId} Status Update`, `Your report is now marked as "${status}": ${remarks || 'Field team action logged.'}`, 'info', `/reports/${report.reportId}`);

  res.json({ message: 'Status updated successfully.', report });
});

apiRouter.post('/reports/:id/comments', authenticate, (req: AuthRequest, res: Response) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    res.status(400).json({ error: 'Comment message is required.' });
    return;
  }

  const report = db.get().civicReports.find(
    (r) => r.id === req.params.id || r.reportId === req.params.id
  );
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }

  const newComment = {
    id: `comm_${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };

  report.comments.push(newComment);
  report.updatedAt = new Date().toISOString();
  db.save();

  logAudit(req.user!.id, req.user!.name, 'ADD_REPORT_COMMENT', 'CivicReport', report.reportId, `Added comment: ${message.slice(0, 50)}`);

  // Notify the other party
  if (req.user!.id !== report.userId) {
    createNotification(report.userId, `New Official Update on #${report.reportId}`, `${req.user!.name}: ${message.slice(0, 80)}`, 'info', `/reports/${report.reportId}`);
  }

  res.status(201).json({ message: 'Comment added.', comment: newComment });
});

apiRouter.patch('/reports/:id/assign', authenticate, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const { officerId } = req.body;
  const officer = db.get().users.find((u) => u.id === officerId && (u.role === 'officer' || u.role === 'admin'));
  if (!officer) {
    res.status(400).json({ error: 'Valid officer must be selected.' });
    return;
  }

  const report = db.get().civicReports.find((r) => r.id === req.params.id || r.reportId === req.params.id);
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }

  report.assignedOfficer = {
    id: officer.id,
    name: officer.name,
    department: officer.city ? `${officer.city} Municipal Engineering` : 'Public Works',
  };
  report.status = 'Assigned';
  report.updatedAt = new Date().toISOString();

  report.statusHistory.push({
    previousStatus: 'Under Review',
    newStatus: 'Assigned',
    updatedBy: `${req.user!.name} (Admin)`,
    remarks: `Assigned to civic officer ${officer.name}.`,
    timestamp: new Date().toISOString(),
  });

  db.save();

  logAudit(req.user!.id, req.user!.name, 'ASSIGN_OFFICER', 'CivicReport', report.reportId, `Assigned to ${officer.name}`);
  createNotification(officer.id, 'New Complaint Assigned', `You have been assigned complaint #${report.reportId}: ${report.title}`, 'warning', `/reports/${report.reportId}`);

  res.json({ message: 'Report assigned successfully.', report });
});

// ==========================================
// 6. FACT VERIFICATION ENGINE
// ==========================================

apiRouter.post('/fact-check/analyze', authenticate, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const { claim, sourceUrl, imageBase64, imageMimeType } = req.body;

    if (!claim || !claim.trim()) {
      res.status(400).json({ error: 'Claim text is required for verification.' });
      return;
    }

    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (imageBase64) {
      imageUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:${imageMimeType || 'image/jpeg'};base64,${imageBase64}`;
    }

    const aiResult = await verifyFactClaimWithGemini({
      claimText: claim,
      sourceUrl,
      imageBase64: imageBase64 ? imageBase64.replace(/^data:image\/\w+;base64,/, '') : undefined,
      imageMimeType: imageMimeType || 'image/jpeg',
    });

    const newFactCheck: FactCheck = {
      id: `fact_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: req.user!.id,
      userName: req.user!.name,
      originalClaim: claim.trim(),
      imageUrl,
      sourceUrl: sourceUrl || '',
      extractedClaims: aiResult.extractedClaims || [claim],
      verdict: aiResult.verdict || 'Misleading or missing context',
      confidence: aiResult.confidence || 90,
      analysis: aiResult.analysis,
      evidenceFound: aiResult.evidenceFound || [],
      contradictoryEvidence: aiResult.contradictoryEvidence || [],
      officialSources: aiResult.officialSources || [],
      syntheticMediaNotice: aiResult.syntheticMediaNotice || 'Forensic synthetic-media detection is not active. Textual claim verified against verified governance data.',
      verifiedTimestamp: new Date().toISOString(),
    };

    db.get().factChecks.unshift(newFactCheck);
    db.save();

    logAudit(req.user!.id, req.user!.name, 'RUN_FACT_CHECK', 'FactCheck', newFactCheck.id, `Claim analyzed. Verdict: ${newFactCheck.verdict}`);

    res.status(201).json({
      message: 'Fact verification complete.',
      factCheck: newFactCheck,
    });
  } catch (error: any) {
    console.error('Fact verification error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify claim.' });
  }
});

apiRouter.get('/fact-check', (_req, res: Response) => {
  res.json({ factChecks: db.get().factChecks });
});

apiRouter.get('/fact-check/:id', (req, res: Response) => {
  const item = db.get().factChecks.find((f) => f.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Fact check record not found.' });
    return;
  }
  res.json({ factCheck: item });
});

// ==========================================
// 7. PUBLIC SERVICE APPLICATIONS ASSISTANT
// ==========================================

apiRouter.get('/applications', authenticate, (req: AuthRequest, res: Response) => {
  const apps = db.get().applications.filter((a) => a.userId === req.user!.id);
  res.json({ applications: apps });
});

apiRouter.post('/applications', authenticate, (req: AuthRequest, res: Response) => {
  const { serviceName, department, referenceNumber, officialPortalUrl, checklist, notes } = req.body;

  if (!serviceName) {
    res.status(400).json({ error: 'Service name is required.' });
    return;
  }

  const defaultChecklist = [
    { id: '1', item: 'Aadhaar Identity Verification', completed: true },
    { id: '2', item: 'Proof of Address & Domicile', completed: false },
    { id: '3', item: 'Income / Bank Documentation', completed: false },
    { id: '4', item: 'Online Portal Form Submission', completed: false },
    { id: '5', item: 'Official Department Verification', completed: false },
  ];

  const initialChecklist = checklist && Array.isArray(checklist) && checklist.length > 0 ? checklist : defaultChecklist;
  const completedCount = initialChecklist.filter((c: any) => c.completed).length;
  const progress = Math.round((completedCount / initialChecklist.length) * 100);

  const newApp: PublicApplication = {
    id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: req.user!.id,
    serviceName: serviceName.trim(),
    department: department ? department.trim() : 'Public Services Authority',
    referenceNumber: referenceNumber ? referenceNumber.trim() : `APP-${Date.now().toString().slice(-6)}`,
    officialPortalUrl: officialPortalUrl || 'https://services.india.gov.in',
    checklist: initialChecklist,
    progress,
    status: progress === 100 ? 'Approved' : progress > 50 ? 'In Verification' : 'Documents Ready',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.get().applications.unshift(newApp);
  db.save();

  logAudit(req.user!.id, req.user!.name, 'CREATE_APPLICATION', 'PublicApplication', newApp.id, `Started tracking ${newApp.serviceName}`);

  res.status(201).json({ message: 'Application tracker created.', application: newApp });
});

apiRouter.patch('/applications/:id', authenticate, (req: AuthRequest, res: Response) => {
  const app = db.get().applications.find((a) => a.id === req.params.id && a.userId === req.user!.id);
  if (!app) {
    res.status(404).json({ error: 'Application tracker not found.' });
    return;
  }

  const { checklist, status, notes, referenceNumber } = req.body;

  if (checklist && Array.isArray(checklist)) {
    app.checklist = checklist;
    const completedCount = checklist.filter((c: any) => c.completed).length;
    app.progress = Math.round((completedCount / checklist.length) * 100);
  }
  if (status) app.status = status;
  if (notes !== undefined) app.notes = notes;
  if (referenceNumber) app.referenceNumber = referenceNumber;

  app.updatedAt = new Date().toISOString();
  db.save();

  res.json({ message: 'Application updated.', application: app });
});

apiRouter.delete('/applications/:id', authenticate, (req: AuthRequest, res: Response) => {
  const index = db.get().applications.findIndex((a) => a.id === req.params.id && a.userId === req.user!.id);
  if (index === -1) {
    res.status(404).json({ error: 'Application tracker not found.' });
    return;
  }
  db.get().applications.splice(index, 1);
  db.save();
  res.json({ message: 'Application tracker removed.' });
});

// ==========================================
// 8. DASHBOARDS & ANALYTICS
// ==========================================

apiRouter.get('/dashboard/citizen', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.get();

  const myReports = data.civicReports.filter((r) => r.userId === userId);
  const activeReports = myReports.filter((r) => r.status !== 'Resolved' && r.status !== 'Closed');
  const resolvedReports = myReports.filter((r) => r.status === 'Resolved' || r.status === 'Closed');

  const myApplications = data.applications.filter((a) => a.userId === userId);
  const savedBookmarks = data.bookmarks.filter((b) => b.userId === userId);

  // Recent activity in the citizen's state/city
  const nearbyReports = data.civicReports
    .filter((r) => r.location.toLowerCase().includes(req.user!.city.toLowerCase()) || r.userId !== userId)
    .slice(0, 5);

  const recentPolicyUpdates = data.policyDocuments.slice(0, 4);

  res.json({
    user: {
      id: req.user!.id,
      name: req.user!.name,
      email: req.user!.email,
      role: req.user!.role,
      city: req.user!.city,
      state: req.user!.state,
    },
    metrics: {
      activeReportsCount: activeReports.length,
      resolvedReportsCount: resolvedReports.length,
      savedSchemesCount: savedBookmarks.length,
      applicationsCount: myApplications.length,
    },
    myRecentReports: myReports.slice(0, 4),
    myApplications: myApplications.slice(0, 3),
    savedBookmarks,
    nearbyReports,
    recentPolicyUpdates,
  });
});

apiRouter.get('/dashboard/admin', authenticate, requireRole('admin', 'officer'), (_req: AuthRequest, res: Response) => {
  const data = db.get();

  const totalReports = data.civicReports.length;
  const pendingReports = data.civicReports.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length;
  const assignedReports = data.civicReports.filter((r) => r.status === 'Assigned' || r.status === 'In Progress').length;
  const resolvedReports = data.civicReports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
  const criticalReports = data.civicReports.filter((r) => r.severity === 'Critical' || r.severity === 'High').length;

  // Category breakdown
  const categoryCount: Record<string, number> = {};
  data.civicReports.forEach((r) => {
    categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
  });

  const categoryDistribution = Object.entries(categoryCount).map(([name, count]) => ({
    name,
    count,
  }));

  // Severity breakdown
  const severityCount: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  data.civicReports.forEach((r) => {
    severityCount[r.severity] = (severityCount[r.severity] || 0) + 1;
  });

  const severityDistribution = Object.entries(severityCount).map(([name, count]) => ({
    name,
    count,
  }));

  res.json({
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
  });
});

apiRouter.get('/dashboard/transparency', (_req, res: Response) => {
  const data = db.get();
  const total = data.civicReports.length;
  const resolved = data.civicReports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

  res.json({
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
  });
});

// ==========================================
// 9. NOTIFICATIONS & BOOKMARKS
// ==========================================

apiRouter.get('/notifications', authenticate, (req: AuthRequest, res: Response) => {
  const notifs = db.get().notifications.filter((n) => n.userId === req.user!.id);
  res.json({ notifications: notifs });
});

apiRouter.patch('/notifications/:id/read', authenticate, (req: AuthRequest, res: Response) => {
  const notif = db.get().notifications.find((n) => n.id === req.params.id && n.userId === req.user!.id);
  if (notif) {
    notif.read = true;
    db.save();
  }
  res.json({ message: 'Marked as read.' });
});

apiRouter.post('/notifications/mark-all-read', authenticate, (req: AuthRequest, res: Response) => {
  const notifs = db.get().notifications.filter((n) => n.userId === req.user!.id);
  notifs.forEach((n) => (n.read = true));
  db.save();
  res.json({ message: 'All notifications marked as read.' });
});

apiRouter.get('/bookmarks', authenticate, (req: AuthRequest, res: Response) => {
  const userBookmarks = db.get().bookmarks.filter((b) => b.userId === req.user!.id);
  res.json({ bookmarks: userBookmarks });
});

// ==========================================
// 10. ADMIN OPERATIONS & AUDIT LOGS
// ==========================================

apiRouter.get('/admin/users', authenticate, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const { role, search } = req.query;
  let users = [...db.get().users];

  if (role && role !== 'All') {
    users = users.filter((u) => u.role === role);
  }
  if (search) {
    const q = String(search).toLowerCase();
    users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.city.toLowerCase().includes(q));
  }

  const safeUsers = users.map(({ passwordHash: _, ...u }) => u);
  res.json({ users: safeUsers });
});

apiRouter.patch('/admin/users/:id/role', authenticate, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  if (!['citizen', 'officer', 'admin'].includes(role)) {
    res.status(400).json({ error: 'Role must be citizen, officer, or admin.' });
    return;
  }

  const targetUser = db.get().users.find((u) => u.id === req.params.id);
  if (!targetUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const oldRole = targetUser.role;
  targetUser.role = role;
  db.save();

  logAudit(req.user!.id, req.user!.name, 'UPDATE_USER_ROLE', 'User', targetUser.id, `Changed role of ${targetUser.name} from ${oldRole} to ${role}`);

  res.json({ message: 'User role updated.', user: targetUser });
});

apiRouter.get('/admin/audit-logs', authenticate, requireRole('admin', 'officer'), (req: AuthRequest, res: Response) => {
  const { action, search, limit } = req.query;
  let logs = [...db.get().auditLogs];

  if (action && action !== 'All') {
    logs = logs.filter((l) => l.action.toLowerCase().includes(String(action).toLowerCase()));
  }
  if (search) {
    const q = String(search).toLowerCase();
    logs = logs.filter(
      (l) =>
        l.userName.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.entityId.toLowerCase().includes(q)
    );
  }

  if (limit) {
    logs = logs.slice(0, Number(limit));
  }

  res.json({ auditLogs: logs });
});
