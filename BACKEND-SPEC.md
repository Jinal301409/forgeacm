# CivicLens AI — Comprehensive Backend Audit, Specification & Architecture Plan

**Document Version:** 1.0.0  
**Status:** Audit Complete — Awaiting Approval Before Implementation  
**Auditor:** Senior Backend Engineer & Security Reviewer  
**Target Platform:** CivicLens AI (AI-Powered Civic Governance, Policy Intelligence & Grievance Redressal Platform)

---

## 1. Executive Summary & Audit Overview

CivicLens AI is designed as a mission-critical digital governance platform serving three distinct user archetypes:
1. **Citizens:** Explore policies in 6 Indian languages, verify viral claims against official gazettes, submit geolocated multimodal civic complaints, track grievance resolution with SLA countdowns, and check welfare scheme eligibility.
2. **Civic Officers:** Review assigned complaints, inspect AI categorization/severity estimations, update work orders with progress remarks, and upload resolution proof.
3. **Municipal Administrators:** Supervise departmental SLAs, assign field officers, audit cryptographic immutable system logs, manage official gazette circulars, control user permissions, and analyze macro-level civic metrics.

### Key Audit Findings
The current backend is a monolithic prototype built on Express and a single JSON file (`data/civiclens-db.json`) wrapped in synchronous disk writes. While the application's concept and frontend interface are sophisticated, the backend has severe security holes, missing endpoints, architectural fragility, and stubbed features:
- **Critical Vulnerability (CVSS 9.8):** Public user registration allows arbitrary assignment of `admin` and `officer` roles via the request payload.
- **Critical Vulnerability (CVSS 9.8):** Password reset takes `{ email, newPassword }` with zero token or identity verification, enabling instantaneous takeover of any account (including `admin@civiclens.gov`).
- **High Vulnerability (CVSS 8.5):** JWT secret falls back to a committed, publicly visible string in `.env.example`. No fail-safe exists in production.
- **High Vulnerability (CVSS 8.0):** Public `/api/upload` endpoint accepts arbitrary files up to 15MB without authentication, extension allowlists, or MIME magic byte validation.
- **Privacy Leak (DPDP 2023 Non-Compliance):** Citizen emails and identities are leaked publicly via `GET /api/reports/:id` and `GET /api/fact-check`.
- **Fake Architecture Claims:** `GET /api/system/status` inspects `process.env.MONGODB_URI` and `process.env.CLOUDINARY_URL` and falsely reports "MongoDB Atlas" and "Cloudinary Cloud Storage" without any driver or client implementation.
- **Fake Document Parsing:** `POST /api/policies/upload` writes a placeholder string (`Document uploaded: file.pdf...`) instead of parsing PDF/image text.
- **AI Inconsistency:** `gemini-3.8-flash` is hardcoded (non-existent model name). When no API key is provided, policy explanation crashes with a 500 error while grievance triage silently fakes an AI result.

---

## 2. Full Endpoint Inventory (from `server/routes.ts`)

| # | Method | Path | Auth Level | Request Body / Params | Response Shape / Status |
|---|---|---|---|---|---|
| 1 | `GET` | `/api/system/status` | Public | None | `200 { status, appName, version, database: { engine, isPersistent, stats }, ai: { provider, model, isConfigured, capabilities }, storage: { provider } }` |
| 2 | `POST` | `/api/upload` | Public *(VULNERABILITY)* | `multipart/form-data` with `file` (max 15MB) | `200 { url, filename, mimetype, size }` or `400 { error }` |
| 3 | `POST` | `/api/auth/register` | Public | JSON: `{ name, email, password, phone?, state?, city?, preferredLanguage?, role?, occupation?, annualIncome?, category? }` | `201 { message, token, user }` or `400/409/500 { error }` |
| 4 | `POST` | `/api/auth/login` | Public | JSON: `{ email, password }` | `200 { message, token, user }` or `400/401/500 { error }` |
| 5 | `GET` | `/api/auth/me` | Bearer Token (`citizen`, `officer`, `admin`) | None | `200 { user, unreadNotifications }` or `401 { error }` |
| 6 | `PATCH` | `/api/auth/profile` | Bearer Token | JSON: `{ name?, phone?, state?, city?, preferredLanguage?, occupation?, annualIncome?, category? }` | `200 { message, user }` or `401 { error }` |
| 7 | `POST` | `/api/auth/forgot-password` | Public | JSON: `{ email }` | `200 { message, demoNote? }` or `400 { error }` |
| 8 | `POST` | `/api/auth/reset-password` | Public *(VULNERABILITY)* | JSON: `{ email, newPassword }` *(No token!)* | `200 { message }` or `400/404 { error }` |
| 9 | `GET` | `/api/policies` | Public | Query: `category?`, `search?`, `language?` | `200 { policies: PolicyDocument[] }` |
| 10 | `GET` | `/api/policies/:id` | Public | Param: `:id` | `200 { policy, explanations: PolicyExplanation[] }` or `404 { error }` |
| 11 | `POST` | `/api/policies/upload` | Bearer Token | `multipart/form-data` or JSON: `{ title, authority?, documentNumber?, category?, sourceUrl?, content?, language? }` | `201 { message, policy }` or `400/500 { error }` |
| 12 | `POST` | `/api/policies/:id/explain` | Bearer Token | Param: `:id`, JSON: `{ targetLanguage?, forceRefresh? }` | `200 { explanation, cached: boolean }` or `404/500 { error }` |
| 13 | `POST` | `/api/policies/:id/ask` | Bearer Token | Param: `:id`, JSON: `{ question }` | `200 { question, answer }` or `400/404/500 { error }` |
| 14 | `GET` | `/api/schemes` | Public | Query: `category?`, `state?`, `search?` | `200 { schemes: Scheme[] }` |
| 15 | `GET` | `/api/schemes/:id` | Public | Param: `:id` | `200 { scheme: Scheme }` or `404 { error }` |
| 16 | `POST` | `/api/schemes/:id/check-eligibility` | Bearer Token | Param: `:id`, JSON: `{ age?, annualIncome?, state?, city?, occupation?, category? }` | `200 { scheme, evaluation }` or `404/500 { error }` |
| 17 | `POST` | `/api/schemes/:id/bookmark` | Bearer Token | Param: `:id` | `200 { bookmarked: true, message }` or `404 { error }` |
| 18 | `DELETE` | `/api/schemes/:id/bookmark` | Bearer Token | Param: `:id` | `200 { bookmarked: false, message }` |
| 19 | `POST` | `/api/reports` | Bearer Token | `multipart/form-data` or JSON: `{ title, description, category, location, address?, latitude?, longitude?, imageBase64?, imageMimeType? }` | `201 { message, report }` or `400/500 { error }` |
| 20 | `GET` | `/api/reports` | Optional Bearer | Query: `category?`, `severity?`, `status?`, `search?`, `limit?` | `200 { reports: CivicReport[] }` (sanitizes `userEmail` for non-owners/public) |
| 21 | `GET` | `/api/reports/my` | Bearer Token | None | `200 { reports: CivicReport[] }` |
| 22 | `GET` | `/api/reports/:id` | Public *(VULNERABILITY)* | Param: `:id` | `200 { report: CivicReport }` *(Returns unsanitized userEmail & personal data)* |
| 23 | `PATCH` | `/api/reports/:id/status` | Bearer Token (`officer`, `admin`) | Param: `:id`, JSON: `{ status, remarks?, resolutionNotes? }` | `200 { message, report }` or `404 { error }` |
| 24 | `POST` | `/api/reports/:id/comments` | Bearer Token | Param: `:id`, JSON: `{ message }` | `201 { message, comment }` or `400/404 { error }` |
| 25 | `PATCH` | `/api/reports/:id/assign` | Bearer Token (`admin`) | Param: `:id`, JSON: `{ officerId }` | `200 { message, report }` or `400/404 { error }` |
| 26 | `POST` | `/api/fact-check/analyze` | Bearer Token | `multipart/form-data` or JSON: `{ claim, sourceUrl?, imageBase64?, imageMimeType? }` | `201 { message, factCheck }` or `400/500 { error }` |
| 27 | `GET` | `/api/fact-check` | Public *(VULNERABILITY)* | None | `200 { factChecks: FactCheck[] }` *(Exposes all users' fact-checks publicly)* |
| 28 | `GET` | `/api/fact-check/:id` | Public | Param: `:id` | `200 { factCheck: FactCheck }` or `404 { error }` |
| 29 | `GET` | `/api/applications` | Bearer Token | None | `200 { applications: PublicApplication[] }` |
| 30 | `POST` | `/api/applications` | Bearer Token | JSON: `{ serviceName, department?, referenceNumber?, officialPortalUrl?, checklist?, notes? }` | `201 { message, application }` or `400 { error }` |
| 31 | `PATCH` | `/api/applications/:id` | Bearer Token | Param: `:id`, JSON: `{ checklist?, status?, notes?, referenceNumber? }` | `200 { message, application }` or `404 { error }` |
| 32 | `DELETE` | `/api/applications/:id` | Bearer Token | Param: `:id` | `200 { message }` or `404 { error }` |
| 33 | `GET` | `/api/dashboard/citizen` | Bearer Token | None | `200 { user, metrics, myRecentReports, myApplications, savedBookmarks, nearbyReports, recentPolicyUpdates }` |
| 34 | `GET` | `/api/dashboard/admin` | Bearer Token (`admin`, `officer`) | None | `200 { metrics, categoryDistribution, severityDistribution, recentReports, recentAuditLogs }` |
| 35 | `GET` | `/api/dashboard/transparency` | Public | None | `200 { totalReports, resolvedReports, resolutionRate, avgResolutionDays, verifiedPoliciesCount, debunkedRumorsCount, schemesCataloged, recentOutcomes }` |
| 36 | `GET` | `/api/notifications` | Bearer Token | None | `200 { notifications: Notification[] }` |
| 37 | `PATCH` | `/api/notifications/:id/read` | Bearer Token | Param: `:id` | `200 { message }` |
| 38 | `POST` | `/api/notifications/mark-all-read` | Bearer Token | None | `200 { message }` |
| 39 | `GET` | `/api/bookmarks` | Bearer Token | None | `200 { bookmarks: Bookmark[] }` |
| 40 | `GET` | `/api/admin/users` | Bearer Token (`admin`) | Query: `role?`, `search?` | `200 { users: SafeUser[] }` |
| 41 | `PATCH` | `/api/admin/users/:id/role` | Bearer Token (`admin`) | Param: `:id`, JSON: `{ role }` | `200 { message, user }` or `400/404 { error }` |
| 42 | `GET` | `/api/admin/audit-logs` | Bearer Token (`admin`, `officer`) | Query: `action?`, `search?`, `limit?` | `200 { auditLogs: AuditLog[] }` |

---

## 3. Frontend `fetch()` Call Matrix vs. Backend Routes

Every single `fetch()` call across `src/` was mapped directly to the server route it targets:

| Calling Frontend File & Line | HTTP Method | Target URL / Query | Auth Sent | Payload Sent | Expected Response Shape | Backend Route | Status & Notes |
|---|---|---|---|---|---|---|---|
| `DashboardLayout.tsx:49` | `GET` | `/api/notifications` | `Bearer ${token}` | None | `{ notifications: Notification[] }` | `GET /api/notifications` | **OK** |
| `AuthContext.tsx:35` | `GET` | `/api/auth/me` | `Bearer ${token}` | None | `{ user, unreadNotifications }` | `GET /api/auth/me` | **OK** |
| `AuthContext.tsx:63` | `POST` | `/api/auth/login` | None | `{ email, password }` | `{ message, token, user }` | `POST /api/auth/login` | **OK** |
| `AuthContext.tsx:85` | `POST` | `/api/auth/register` | None | `{ name, email, password, phone, state, city, preferredLanguage, ... }` | `{ message, token, user }` | `POST /api/auth/register` | **Security Deficit:** Body accepts `role` parameter. |
| `AuthContext.tsx:112` | `PATCH` | `/api/auth/profile` | `Bearer ${token}` | `{ name, phone, state, city, preferredLanguage, ... }` | `{ message, user }` | `PATCH /api/auth/profile` | **OK** |
| `AdminDashboard.tsx:36` | `GET` | `/api/dashboard/admin` | `Bearer ${token}` | None | `{ metrics, categoryDistribution, severityDistribution, recentReports, recentAuditLogs }` | `GET /api/dashboard/admin` | **Data Deficit:** Metrics like `averageResolutionHours` are hardcoded in backend. |
| `AnalyticsPage.tsx:32` | `GET` | `/api/dashboard/admin` | `Bearer ${token}` | None | `{ metrics, categoryDistribution, severityDistribution, recentReports, recentAuditLogs }` | `GET /api/dashboard/admin` | **Mismatch/Deficit:** `AnalyticsPage` expects rich analytics, but hardcodes weekly trends on frontend. Needs real aggregation endpoint. |
| `AuditLogsPage.tsx:30` | `GET` | `/api/admin/audit-logs?action=...&search=...` | `Bearer ${token}` | None | `{ auditLogs: AuditLog[] }` | `GET /api/admin/audit-logs` | **OK**, needs pagination support. |
| `ComplaintManagementPage.tsx:45` | `GET` | `/api/reports?status=...&severity=...&search=...` | `Bearer ${token}` | None | `{ reports: CivicReport[] }` | `GET /api/reports` | **OK**, needs pagination. |
| `ComplaintManagementPage.tsx:57` | `GET` | `/api/admin/users?role=officer` | `Bearer ${token}` | None | `{ users: User[] }` | `GET /api/admin/users` | **OK** |
| `ComplaintManagementPage.tsx:71` | `PATCH` | `/api/reports/:id/assign` | `Bearer ${token}` | `{ officerId }` | `{ message, report }` | `PATCH /api/reports/:id/assign` | **OK** |
| `ComplaintManagementPage.tsx:96` | `PATCH` | `/api/reports/:id/status` | `Bearer ${token}` | `{ status, remarks, resolutionNotes }` | `{ message, report }` | `PATCH /api/reports/:id/status` | **OK** |
| `PolicyManagementPage.tsx:28` | `GET` | `/api/policies` | None | None | `{ policies: PolicyDocument[] }` | `GET /api/policies` | **OK** |
| `PolicyManagementPage.tsx:40` | `POST` | `/api/policies/upload` | `Bearer ${token}` | `{ title, authority, category, content, sourceUrl }` | `{ message, policy }` | `POST /api/policies/upload` | **OK** |
| `UserManagementPage.tsx:30` | `GET` | `/api/admin/users?role=...&search=...` | `Bearer ${token}` | None | `{ users: User[] }` | `GET /api/admin/users` | **OK** |
| `UserManagementPage.tsx:42` | `PATCH` | `/api/admin/users/:id/role` | `Bearer ${token}` | `{ role }` | `{ message, user }` | `PATCH /api/admin/users/:id/role` | **OK** |
| `ForgotPasswordPage.tsx:20` | `POST` | `/api/auth/reset-password` | None | `{ email, newPassword }` | `{ message }` | `POST /api/auth/reset-password` | **Critical Security Flaw:** No token verification. Will rewire to real forgot-then-reset flow. |
| `CitizenDashboard.tsx:29` | `GET` | `/api/dashboard/citizen` | `Bearer ${token}` | None | `{ user, metrics, myRecentReports, myApplications, savedBookmarks, nearbyReports, recentPolicyUpdates }` | `GET /api/dashboard/citizen` | **OK** |
| `CivicMapPage.tsx:66` | `GET` | `/api/reports` | None | None | `{ reports: CivicReport[] }` | `GET /api/reports` | **OK** |
| `CivicReportPage.tsx:110` | `POST` | `/api/reports` | `Bearer ${token}` | `{ title, description, category, location, address, latitude, longitude, imageBase64, imageMimeType }` | `{ message, report }` | `POST /api/reports` | **Inefficiency:** Sends huge base64 data strings that get stored directly in DB. |
| `CivicTrackingPage.tsx:50` | `GET` | `/api/reports?status=...&category=...` | Optional `Bearer` | None | `{ reports: CivicReport[] }` | `GET /api/reports` | **OK** |
| `CivicTrackingPage.tsx:73` | `POST` | `/api/reports/:id/comments` | `Bearer ${token}` | `{ message }` | `{ message, comment }` | `POST /api/reports/:id/comments` | **OK** |
| `CivicTrackingPage.tsx:105` | `PATCH` | `/api/reports/:id/status` | `Bearer ${token}` | `{ status, remarks, resolutionNotes }` | `{ message, report }` | `PATCH /api/reports/:id/status` | **RBAC Note:** Citizens attempting status update will get 403 unless officer/admin. |
| `FactVerificationPage.tsx:30` | `GET` | `/api/fact-check` | None | None | `{ factChecks: FactCheck[] }` | `GET /api/fact-check` | **Privacy Leak:** Public can see all fact checks across all users. Must scope by user, admin sees all. |
| `FactVerificationPage.tsx:55` | `POST` | `/api/fact-check/analyze` | `Bearer ${token}` | `{ claim, sourceUrl, imageBase64, imageMimeType }` | `{ message, factCheck }` | `POST /api/fact-check/analyze` | **OK** |
| `MyApplicationsPage.tsx:34` | `GET` | `/api/applications` | `Bearer ${token}` | None | `{ applications: PublicApplication[] }` | `GET /api/applications` | **OK** |
| `MyApplicationsPage.tsx:53` | `PATCH` | `/api/applications/:id` | `Bearer ${token}` | `{ checklist, status }` | `{ message, application }` | `PATCH /api/applications/:id` | **OK** |
| `MyApplicationsPage.tsx:71` | `DELETE` | `/api/applications/:id` | `Bearer ${token}` | None | `{ message }` | `DELETE /api/applications/:id` | **OK** |
| `MyApplicationsPage.tsx:87` | `POST` | `/api/applications` | `Bearer ${token}` | `{ serviceName, department, referenceNumber, officialPortalUrl }` | `{ message, application }` | `POST /api/applications` | **OK** |
| `NotificationsPage.tsx:22` | `GET` | `/api/notifications` | `Bearer ${token}` | None | `{ notifications: Notification[] }` | `GET /api/notifications` | **OK** |
| `NotificationsPage.tsx:32` | `PATCH` | `/api/notifications/:id/read` | `Bearer ${token}` | None | `{ message }` | `PATCH /api/notifications/:id/read` | **OK** |
| `NotificationsPage.tsx:46` | `POST` | `/api/notifications/mark-all-read` | `Bearer ${token}` | None | `{ message }` | `POST /api/notifications/mark-all-read` | **OK** |
| `PolicyExplainerPage.tsx:52` | `GET` | `/api/policies` | None | None | `{ policies: PolicyDocument[] }` | `GET /api/policies` | **OK** |
| `PolicyExplainerPage.tsx:76` | `POST` | `/api/policies/:id/explain` | `Bearer ${token}` | `{ targetLanguage }` | `{ explanation, cached }` | `POST /api/policies/:id/explain` | **OK** |
| `PolicyExplainerPage.tsx:109` | `POST` | `/api/policies/:id/ask` | `Bearer ${token}` | `{ question }` | `{ question, answer }` | `POST /api/policies/:id/ask` | **OK** |
| `PolicyExplainerPage.tsx:140` | `POST` | `/api/policies/upload` | `Bearer ${token}` | `{ title, authority, category, content }` | `{ message, policy }` | `POST /api/policies/upload` | **OK** |
| `SchemeExplorerPage.tsx:66` | `GET` | `/api/bookmarks` | `Bearer ${token}` | None | `{ bookmarks: Bookmark[] }` | `GET /api/bookmarks` | **OK** |
| `SchemeExplorerPage.tsx:84` | `GET` | `/api/schemes?category=...&state=...` | None | None | `{ schemes: Scheme[] }` | `GET /api/schemes` | **OK** |
| `SchemeExplorerPage.tsx:106` | `DELETE` | `/api/schemes/:id/bookmark` | `Bearer ${token}` | None | `{ bookmarked: false, message }` | `DELETE /api/schemes/:id/bookmark` | **OK** |
| `SchemeExplorerPage.tsx:112` | `POST` | `/api/schemes/:id/bookmark` | `Bearer ${token}` | None | `{ bookmarked: true, message }` | `POST /api/schemes/:id/bookmark` | **OK** |
| `SchemeExplorerPage.tsx:129` | `POST` | `/api/schemes/:id/check-eligibility` | `Bearer ${token}` | User demographic profile | `{ scheme, evaluation }` | `POST /api/schemes/:id/check-eligibility` | **OK** |
| `LandingPage.tsx:85` | `GET` | `/api/dashboard/transparency` | None | None | Transparency metrics | `GET /api/dashboard/transparency` | **OK** |
| `TransparencyPage.tsx:22` | `GET` | `/api/dashboard/transparency` | None | None | Transparency metrics | `GET /api/dashboard/transparency` | **OK** |

### Identified Gaps: Missing Routes & Fake/Stubbed UI Behavior
1. **SettingsPage.tsx (Lines 19–42):**
   - Data Export: The frontend creates a synthetic client-side JSON blob. Under DPDP 2023, data must be exported from the server authority. Missing `GET /api/auth/me/export`.
   - Account Deletion: The frontend issues a browser `confirm()` and calls local `logout()`. No backend deletion occurs. Missing `DELETE /api/auth/me`.
   - Password Change: Missing `POST /api/auth/change-password` (requires current password + new password).
2. **PolicyManagementPage.tsx:**
   - Missing `PATCH /api/policies/:id` (edit title, authority, category).
   - Missing `PATCH /api/policies/:id/verify` (toggle verification status: Official / Under Review / Community Upload).
   - Missing `DELETE /api/policies/:id` (delete policy + cascade explanations & bookmarks).
3. **UserManagementPage.tsx:**
   - Missing `POST /api/admin/users` (Admin creates officers/admins).
   - Missing `PATCH /api/admin/users/:id` (Disable/enable user, update department/city).
   - Missing `DELETE /api/admin/users/:id` (Admin deletes user account with safeguards).
4. **Scheme Management:**
   - Missing `POST /api/schemes`, `PATCH /api/schemes/:id`, `DELETE /api/schemes/:id` for full administrative scheme catalog lifecycle.
5. **AnalyticsPage.tsx:**
   - Resolution trend (Mon-Sun), SLA compliance, first-time fix rates, and satisfaction rates are hardcoded on frontend. Missing backend analytics aggregation endpoints (`GET /api/admin/analytics/overview`, `GET /api/admin/analytics/trends`).
6. **AuditLogsPage.tsx:**
   - Missing `GET /api/admin/audit-logs/export` (CSV export required for compliance auditing).

---

## 4. Vulnerabilities, Bugs, and Stub Behavior Inventory

| Issue ID | Severity | Category | File & Location | Description & Impact | Planned Remediation |
|---|---|---|---|---|---|
| **VULN-01** | **CRITICAL** (CVSS 9.8) | Privilege Escalation | `server/routes.ts:165` | Public registration accepts `role: 'admin'` or `'officer'` directly from the request body. Anyone can register as a root admin. | Force `role = 'citizen'` on public registration. Officers and admins can only be created by an authenticated admin via `POST /api/admin/users`. |
| **VULN-02** | **CRITICAL** (CVSS 9.8) | Authentication Bypass / Account Takeover | `server/routes.ts:288-304` | `POST /api/auth/reset-password` accepts `{ email, newPassword }` with zero token verification. Anyone can reset any password. | Replace with cryptographically random single-use reset token (SHA-256 hash stored in DB, expires in 30m). Send via nodemailer SMTP if configured, or expose `devResetToken` strictly in dev mode. |
| **VULN-03** | **HIGH** (CVSS 8.5) | Insecure Configuration | `server/auth.ts:9` | Hardcoded fallback string `civiclens_super_secure_jwt_token_key_2025` is used if `JWT_SECRET` is unset, matching `.env.example`. | Require non-empty, strong `JWT_SECRET` (min 32 chars) in production; abort startup immediately if weak or missing. |
| **VULN-04** | **HIGH** (CVSS 8.1) | Broken Session Revocation | `server/auth.ts:36-47` | Tokens remain valid for 7 days even if a user's password changes, or if an admin disables or bans the user account. | Add `tokenVersion` and `isActive` boolean to `User`. Verify `tokenVersion` in JWT payload matches DB user record and reject disabled accounts. |
| **VULN-05** | **HIGH** (CVSS 8.0) | Arbitrary File Upload | `server/routes.ts:121-134` | `POST /api/upload` is unauthenticated, accepts all file types (no MIME allowlist), and preserves unsafe extensions. | Require authentication, enforce strict MIME and extension allowlists, verify magic bytes (`file-type`), randomize filenames, and cap size. |
| **VULN-06** | **HIGH** (CVSS 7.5) | PII Data Exposure | `server/routes.ts:735-744` | `GET /api/reports/:id` is public and returns citizen's `userEmail` and personal details without any sanitization. | Require authentication or strip PII (email, phone, exact user identifier) for public viewers. Citizens can only see their own private info; officers/admins see assigned info. |
| **VULN-07** | **MEDIUM** (CVSS 6.8) | Denial of Service / Brute Force | `server.ts:27-29` | No rate limiting on auth endpoints (`/auth/login`, `/auth/register`, `/auth/reset-password`), AI endpoints, or file uploads. Global 25MB body limit on all routes. | Implement multi-tiered `express-rate-limit`: general, auth, AI, upload. Route-specific body limits (e.g. 100KB for auth, 15MB for file upload). |
| **VULN-08** | **MEDIUM** (CVSS 6.5) | PII Exposure | `server/routes.ts:916-918` | `GET /api/fact-check` returns every citizen's fact verification queries to the entire internet. | Restrict list to logged-in user's own checks. Admins can see all. |
| **VULN-09** | **MEDIUM** (CVSS 6.2) | Security Misconfiguration | `server.ts:27` | CORS is wide-open (`cors()`) with no origin restriction. No HTTP security headers (`helmet`). Missing `trust proxy` setting. | Add `helmet`, configure CORS allowlist via `APP_URL`, enable `app.set('trust proxy', 1)`. |
| **VULN-10** | **MEDIUM** (CVSS 5.8) | Routing Flaw | `server.ts:39-58` | Unknown `/api/*` routes fall through to Vite / Express SPA catch-all, returning HTTP 200 with HTML instead of JSON 404. | Add explicit 404 JSON middleware for unmatched `/api/*` requests before the SPA fallback. |
| **STUB-01** | **HIGH** | Fake Database / Storage Claims | `server/routes.ts:89,116` | Checks `process.env.MONGODB_URI` and claims "MongoDB Atlas" even though no MongoDB client exists. Same for Cloudinary. | Implement real MongoDB driver connection pool and Cloudinary SDK uploader, with safe local fallbacks. |
| **STUB-02** | **HIGH** | Fake PDF Text Extraction | `server/routes.ts:351-358` | Non-text files are saved with placeholder string: `"Document uploaded: file.pdf..."`. AI explains nothing. | Implement real PDF parsing via `pdf-parse`, plain text reader, and OCR vision via Gemini for document images. |
| **STUB-03** | **MEDIUM** | Inconsistent AI Failures | `server/gemini.ts:246,318` | `triageCivicIssueWithGemini` silently returns fake triage results when key is missing, while `explainPolicy` throws a 500 error. | Return uniform 503 error codes (`AI_NOT_CONFIGURED` or `AI_UNAVAILABLE`) unless `DEMO_AI_FALLBACK=true` is set. Flag fallback triage explicitly (`aiAnalysis.isFallback = true`). |
| **STUB-04** | **LOW** | Colliding Report IDs | `server/routes.ts:628-629` | Generates report IDs using `Math.random() * 9000` (`CIVIC-YYYY-NNNN`). Collisions occur within hundreds of reports. | Implement sequential, atomic counter for report IDs. |
| **DATA-01** | **HIGH** | Data Loss on Restart | `server/db.ts:277-283` | Synchronous file write on every mutation blocks the event loop and loses data on ephemeral containers. | Introduce async serialized write queue with debounced atomic flushes, plus MongoDB driver persistence. |

---

## 5. Target Architecture & Engineering Blueprint

```
                      +---------------------------------------+
                      |       Vite + React 19 Frontend       |
                      |  (Client-side SPA, JWT in Storage)   |
                      +-------------------+-------------------+
                                          | HTTP / API calls
                                          v
+---------------------------------------------------------------------------------+
|                         CivicLens AI Express Backend                            |
|                                                                                 |
|  [Security Perimeter]                                                           |
|  - Helmet (CSP, HSTS, Sniff-defense)                                            |
|  - Dynamic CORS (APP_URL allowlist)                                             |
|  - Rate Limiters (Auth: 10/15m, AI: 20/min, Upload: 10/15m, Global: 200/15m)     |
|  - Request IDs & Pino Structured Logging                                        |
|                                                                                 |
|  [Middleware Pipeline]                                                          |
|  - Zod Request Validators (Body, Query, Params)                                 |
|  - Authentication & Token Version Verification                                  |
|  - RBAC Guard (Citizen vs. Officer vs. Admin)                                   |
|                                                                                 |
|  [Business Logic / Controllers]                                                 |
|  - Auth & DPDP Compliance (Register, Login, Password Reset, Data Export)        |
|  - Policy Intelligence (Extraction, Explain, Grounded Q&A, Admin CRUD)          |
|  - Civic Grievances (Atomic Sequence, Duplicate Detection, SLA Monitor)         |
|  - Fact Verification (Official Source Grounding, Rumor Debunking)               |
|  - Scheme Eligibility (Deterministic Rule Engine + Gemini NL Explanation)       |
|  - Municipal Dashboards (Real Data Aggregations, Dynamic Category/Severity)     |
|                                                                                 |
|  [Service Integrations]                                                         |
|  - Gemini AI Service (Configurable model, backoff retry, prompt defense)        |
|  - File Ingestion Engine (Multer, Magic Bytes, Cloudinary / uploads/)           |
|  - PDF Parser (Real text extraction)                                            |
|  - Emailer (Nodemailer SMTP / Dev token fallback)                               |
|                                                                                 |
|  [Repository & Data Access Layer]                                               |
|               +-----------------------+-----------------------+                 |
|               |                                               |                 |
|               v                                               v                 |
|  +-------------------------+                     +---------------------------+  |
|  |     MongoDB Driver      | (if MONGODB_URI)    |   Safe Atomic JSON File   |  |
|  | (Atlas Cloud Database)  |                     | (Async write queue, mutex)|  |
|  +-------------------------+                     +---------------------------+  |
+---------------------------------------------------------------------------------+
```

### 5.1 Role & Ownership Access Matrix (RBAC)

| Resource / Endpoint | Citizen | Officer | Admin | Public / Unauth |
|---|---|---|---|---|
| `POST /auth/register` | Can register (citizen only) | N/A | N/A | Can register |
| `POST /admin/users` | Forbidden (403) | Forbidden (403) | **Allowed** | Forbidden (401) |
| `GET /admin/users` | Forbidden (403) | Forbidden (403) | **Allowed** (with filters) | Forbidden (401) |
| `PATCH /admin/users/:id` | Forbidden (403) | Forbidden (403) | **Allowed** (cannot demote self or remove last admin) | Forbidden (401) |
| `DELETE /admin/users/:id` | Forbidden (403) | Forbidden (403) | **Allowed** (cannot delete self) | Forbidden (401) |
| `GET /auth/me/export` | **Own Data Only** | **Own Data Only** | **Own Data Only** | Forbidden (401) |
| `DELETE /auth/me` | **Own Account Only** | **Own Account Only** | Allowed (unless last admin) | Forbidden (401) |
| `GET /policies` | **Allowed** | **Allowed** | **Allowed** | **Allowed** |
| `POST /policies/upload` | Allowed (marked `Community Upload`) | Allowed (marked `Official`) | Allowed (marked `Official`) | Forbidden (401) |
| `PATCH/DELETE /policies/:id` | Own uploads only | Edit/verify allowed | **Allowed** (All) | Forbidden (401) |
| `GET /reports` | Own + Sanitized public feed | Assigned + Unassigned queue | **All Reports** (Unsanitized) | Sanitized public feed |
| `GET /reports/:id` | Own report (Full) / Others (Sanitized) | Assigned report (Full) | **Full report** | Sanitized (No PII) |
| `POST /reports` | **Allowed** | **Allowed** | **Allowed** | Forbidden (401) |
| `PATCH /reports/:id/status`| Can close/reopen own report | Assigned reports only | **All Reports** | Forbidden (401) |
| `PATCH /reports/:id/assign`| Forbidden (403) | Forbidden (403) | **Allowed** | Forbidden (401) |
| `POST /reports/:id/comments`| Allowed on own report | Allowed on assigned report | **Allowed on all** | Forbidden (401) |
| `GET /fact-check` | Own fact-checks only | Own fact-checks only | **All Fact-Checks** | Forbidden (401) |
| `POST /fact-check/analyze` | **Allowed** | **Allowed** | **Allowed** | Forbidden (401) |
| `GET /schemes` | **Allowed** | **Allowed** | **Allowed** | **Allowed** |
| `POST/PATCH/DELETE /schemes`| Forbidden (403) | Forbidden (403) | **Allowed** | Forbidden (401) |
| `GET /dashboard/admin` | Forbidden (403) | **Allowed** | **Allowed** | Forbidden (401) |
| `GET /dashboard/transparency`| **Allowed** | **Allowed** | **Allowed** | **Allowed** |
| `GET /admin/audit-logs` | Forbidden (403) | Forbidden (403) | **Allowed** | Forbidden (401) |

---

## 6. Implementation Phases & Execution Roadmap

### Phase 1: Authentication, Security & Hardening
- **Registration Hardening:** Strict Zod schema (email format, password min 8 chars with letter + number, name min 2 chars, phone regex, language allowlist). Force role to `citizen`.
- **Admin User Management:** `POST /admin/users` (create officer/admin), `PATCH /admin/users/:id` (role, active flag, department), `DELETE /admin/users/:id`. Prevent self-demotion and last-admin deletion.
- **Login Brute-Force Defense:** Rate limit login attempts per IP and email. Constant-time password comparison.
- **JWT Architecture:** Fail startup in production if `JWT_SECRET` is unset or default. Add `tokenVersion` to users; increment on password change/reset. Check `isActive` status.
- **Secure Password Reset Flow:**
  - `POST /auth/forgot-password`: generates crypto 32-byte token, hashes with SHA-256 for DB storage, 30-minute expiry. Dispatches email via Nodemailer if SMTP configured; returns `devResetToken` strictly when `NODE_ENV != 'production'`.
  - `POST /auth/reset-password`: validates `{ token, newPassword }`, finds hashed token, updates password, increments `tokenVersion`, invalidates token.
  - Rewire `ForgotPasswordPage.tsx` minimally to handle token input seamlessly.
- **DPDP Compliance Endpoints:**
  - `POST /auth/change-password`: requires `currentPassword` and `newPassword`.
  - `GET /auth/me/export`: returns complete JSON archive of user's personal data.
  - `DELETE /auth/me`: deletes account and purges personal associations.
- **Infrastructure Security:** Helmet, APP_URL-based CORS, rate limit tiers, explicit `/api/*` 404 handler, `trust proxy` configuration.
- **Audit Logging:** Record all auth events (success, failure, registration, role modification, password reset).

### Phase 2: Persistent Data Layer & Database Repository
- **Repository Pattern:** Create `server/repo/` abstracting data operations away from Express routes.
- **MongoDB Atlas Driver:** Implement official `mongodb` client with connection pooling, automatic index creation, sequential report counters, and atomic operations.
- **Safe JSON-File Fallback:** Asynchronous write queue, atomic temp-file write + rename with file locking, in-memory cache, graceful flush on SIGINT/SIGTERM.
- **Migration Utility:** Provide `npm run db:migrate-json-to-mongo` to migrate existing data cleanly.
- **Pagination & Sorting:** Add standard `page`, `limit`, `sort`, `order` query support across all list endpoints. Return additive `{ items, total, page, limit, [legacyKey] }`.
- **Sequential Report IDs:** Monotonic atomic sequence `CIVIC-YYYY-NNNN`.
- **System Status Check:** Update `/api/system/status` to probe actual DB connection and return genuine engine status.

### Phase 3: File Uploads & Document Ingestion Engine
- **Authenticated Uploads:** Require valid JWT on all upload endpoints.
- **File Validation:** Allowlist MIME types and extensions. Verify magic bytes with `file-type`. Enforce per-type size limits.
- **Storage Providers:** Implement Cloudinary upload when `CLOUDINARY_URL` is set; fall back to structured local disk (`uploads/`). Stop storing base64 strings in DB records.
- **Real Document Text Extraction:**
  - PDF extraction via `pdf-parse`.
  - Plain text & JSON extraction.
  - Document image OCR via Gemini Vision.
  - Graceful truncation notification for documents exceeding context windows.
- **Policy Lifecycle Endpoints:** `PATCH /api/policies/:id`, `PATCH /api/policies/:id/verify`, `DELETE /api/policies/:id`.

### Phase 4: Production AI Layer (Gemini)
- **Model Configuration:** Make model configurable via `GEMINI_MODEL` (defaulting to current `gemini-3.8-flash`). Verify model connectivity on startup.
- **Resilience:** AbortController timeouts (30s), exponential backoff retries on 429/503 errors.
- **Structured Output & Zod Validation:** Validate and sanitize every Gemini JSON response. Fall back to clean defaults if malformed.
- **Prompt Injection Defense:** Wrap user claims and policy texts in XML/boundary tags with explicit instructions to ignore embedded system overrides.
- **Policy Grounding & Explicitness:** Split citations into `explicitStatement` (verbatim substring checked) vs `aiInterpretation`. Support 6 languages.
- **Fact Verification Grounding:** Ground against verified government domains (`.gov.in`, `.nic.in`, `pib.gov.in`).
- **Deterministic Scheme Matching:** Compute hard math rules (age, income, state) first, then augment with Gemini natural language explanations.
- **Duplicate Grievance Detection:** Haversine distance (<150m) + category + time window against existing reports.

### Phase 5: Business Logic, RBAC & Complete Endpoints
- **Strict Authorization Review:** Enforce role and ownership checks across all endpoints.
- **Grievance Redressal SLA Lifecycle:** State transitions (`Submitted` -> `Under Review` -> `Assigned` -> `In Progress` -> `Resolved` -> `Closed`). SLA breach calculation. Mandatory remarks.
- **Notification Engine:** Event-driven notification generation on status changes, assignments, officer remarks.
- **Public Service Applications:** Enforce progress calculation and status validation server-side.
- **Scheme Admin CRUD:** `POST`, `PATCH`, `DELETE /api/schemes`.
- **Dynamic Municipal Analytics:** Compute real-time statistics from live DB data for `AnalyticsPage.tsx` and `AdminDashboard.tsx`.
- **Audit Logs:** Advanced filtering, search, and CSV export.

### Phase 6: Production Readiness & Build Pipeline
- **Environment Validation:** Centralized Zod startup validation. Complete `.env.example`.
- **Production Logging:** Structured Pino logger with request ID tracing.
- **Health Check Endpoints:** `GET /health` (liveness) and `GET /ready` (readiness with DB ping).
- **Graceful Shutdown:** Handle SIGTERM/SIGINT by draining in-flight requests and flushing dirty DB caches.
- **Build Pipeline Overhaul:** Bundle server with `esbuild` into `dist-server/server.js`. `npm run build` builds client + server. `npm start` runs `node dist-server/server.js`.
- **Deployment Assets:** Dockerfile, .dockerignore, render.yaml, and DEPLOY.md.

### Phase 7: Automated Tests & Verification
- Integration test suite using `vitest` + `supertest` covering:
  - Auth, registration role protection, password reset token lifecycle.
  - RBAC boundaries and ownership isolation.
  - Grievance report workflow, notifications, and SLA calculation.
  - File upload validation and document extraction.
  - Scheme eligibility rule engine.
- Smoke test script (`scripts/smoke.ts`) exercising every endpoint across all three roles.

### Phase 8: Documentation & Handover
- Comprehensive README update.
- Complete API.md reference.

---

## 7. New Dependencies Rationale

| Package | Purpose | Why It Is Necessary |
|---|---|---|
| `zod` | Schema Validation | Validates request inputs, environment variables at boot, and Gemini structured JSON outputs. |
| `helmet` | Security Headers | Sets mandatory HTTP security headers (CSP, HSTS, XSS protection, MIME sniffing protection). |
| `express-rate-limit` | Rate Limiting | Protects auth from brute-force attacks, guards AI endpoints from quota exhaustion, and prevents upload floods. |
| `mongodb` | MongoDB Driver | Enables production-grade persistence on MongoDB Atlas with indexing and connection pooling. |
| `cloudinary` | Cloud Storage | Provides production cloud media hosting for citizen photo evidence and gazette PDFs. |
| `pdf-parse` | PDF Parsing | Extracts real text from government circulars and gazette notifications. |
| `file-type` | Magic Byte Inspection | Verifies actual binary content of uploaded files to prevent disguised executable uploads. |
| `nodemailer` & `@types/nodemailer` | Email Delivery | Delivers secure password reset links via SMTP. |
| `pino` & `pino-http` | Structured Logging | High-performance JSON logger with request IDs and production log formatting. |
| `compression` & `@types/compression`| Gzip Compression | Compresses HTTP response bodies to optimize throughput. |
| `vitest` & `supertest` & `@types/supertest` | Test Suite | Fast integration test framework to verify all security, RBAC, and business logic guarantees. |

---

## 8. Definition of Done Checklist

- [ ] All 12 known problems resolved.
- [ ] No unauthorized role escalation possible; public registration creates citizen accounts only.
- [ ] Reset password requires single-use token; zero unauthenticated password overrides.
- [ ] Production refuses to boot without strong `JWT_SECRET`.
- [ ] MongoDB Atlas driver fully working when `MONGODB_URI` is provided; safe serialized JSON fallback otherwise.
- [ ] Real PDF text parsing implemented.
- [ ] Gemini AI model configurable, resilient with backoff retry, and grounded in official sources.
- [ ] Strict RBAC enforced: PII stripped from public reports, citizen/officer/admin boundaries locked.
- [ ] Real dynamic municipal analytics computed from live database records.
- [ ] `npm run lint`, `npm run build`, and `npm run test` pass with 0 errors.
- [ ] Containerized with Dockerfile and ready for one-click deployment.
