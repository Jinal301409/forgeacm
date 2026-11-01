# CIVICLENS AI — Understand. Verify. Act.
**AI-Powered Civic Intelligence, Digital Governance & Redressal Platform**

Theme 1: Civic Pulse, Digital Governance & Public Information

---

## 🏛️ Platform Capabilities

1. **Multilingual Policy, Rights & Scheme Explainer**
   - Ingests official government notifications, gazettes, circulars, and PDF documents.
   - Text extraction with OCR fallback for scanned notifications using Google GenAI.
   - Simple-language summaries, key points, eligibility criteria, required documents, step-by-step guides, strict deadlines, and FAQs.
   - **Grounding & Separation:** Explicitly distinguishes between statutory provisions, AI interpretations, and unstated details.
   - Multilingual support across 6 Indian languages: English, Hindi (हिन्दी), Gujarati (ગુજરાતી), Marathi (मराठी), Bengali (বাংলা), Tamil (தமிழ்).
   - Voice Explainer via regional Text-to-Speech (`/api/tts`).

2. **Government Scheme Explorer & Eligibility Engine**
   - Searchable catalog across Healthcare, Housing, Agriculture, Education, Scholarships, Entrepreneurship, Women Welfare, and MSMEs.
   - AI Eligibility Matcher compares citizen age, income, state, and category against published rules with a rule-by-rule breakdown.
   - Direct links to official government submission portals.

3. **Multimodal Civic Grievance Triage & Interactive Map**
   - Citizens upload photo evidence and geocoded locations with GPS pin integration.
   - Gemini multimodal AI triages image and description to determine category, severity (Low, Medium, High, Critical), municipal department, duplicate risks, and recommended actions.
   - Interactive OpenStreetMap (Leaflet) with severity color codes.
   - Status history timeline (`Submitted → Under Review → Assigned → In Progress → Resolved → Closed`).
   - Official communication comments between citizens and ward engineers.

4. **Fact Verification Engine & Deepfake Media Audit**
   - Verifies claims against official government gazettes, Press Information Bureau (PIB) bulletins, and verified governance databases.
   - Four distinct verdicts:
     - `Supported by evidence`
     - `Contradicted by evidence`
     - `Misleading or missing context`
     - `Insufficient evidence`
   - Confidence percentage, official citations, and SHA-256 media forensics inspection.

5. **Autonomous Public Service Application Assistant**
   - Guided step-by-step checklist tracker for public schemes (PM Surya Ghar Solar Subsidy, Ayushman Bharat, Voter ID, Ration Card, etc.).
   - Transparent verification statuses and portal guidance.

6. **Civic Transparency Dashboard & Admin Operations**
   - Public Civic Pulse dashboard with anonymized ward resolution rates and SLA compliance.
   - Admin command desk: Complaint triage, officer dispatch, citizen directory with RBAC role updates, policy vault, operations analytics (Recharts), and cryptographic audit logs.

---

## 🔐 Pre-Seeded Demo Accounts

The application includes 3 pre-seeded test accounts for immediate verification:

| Role | Email | Password | Responsibilities |
|---|---|---|---|
| **Administrator** | `admin@civiclens.gov` | `Admin@12345` | Complaint triage, officer dispatch, role management, audit logs |
| **Civic Officer** | `officer.sharma@civiclens.gov` | `Officer@12345` | Ward engineering, status progression, dispatch notes |
| **Citizen** | `citizen.priya@civiclens.gov` | `Citizen@12345` | Grievance filing, scheme bookmarking, policy exploration |

---

## 💾 MongoDB Atlas Integration

CivicLens AI connects to MongoDB Atlas using the official Node.js driver (`mongodb`).

### Database Collections:
1. `users` — Unique email index, password hashes, roles (`citizen`, `officer`, `admin`), reset tokens.
2. `civic_reports` — Reports with reportId unique index, status history, coordinates, AI triage results.
3. `policies` — Official policy gazettes, extracted content, metadata.
4. `policy_explanations` — Multilingual cached AI summaries and citations.
5. `government_schemes` — Catalog of welfare schemes, eligibility rules, and document requirements.
6. `applications` — Public service application trackers with step checklists.
7. `fact_checks` — Grounded fact verification records, SHA-256 digests, forensics metadata.
8. `notifications` — In-app alerts and SLA updates.
9. `bookmarks` — User bookmarks for schemes and policies with compound unique indexes.
10. `audit_logs` — Immutable administrative event log with timestamps and actor IDs.

### Automatic Seeding & Migration:
- When connecting to a fresh MongoDB Atlas database, CivicLens AI automatically seeds all collections from `data/civiclens-db.json`.
- A standalone migration script is also provided:
  ```bash
  npx tsx server/migrate.ts
  ```

---

## 🛡️ Security & Privacy Architecture

- **Public Registration:** Restricts role assignment strictly to `citizen`. Privileged roles (`officer`, `admin`) can only be granted by an existing administrator.
- **Cryptographic Password Reset:** Two-step flow requiring email verification and a cryptographically secure 6-digit OTP code (`crypto.randomInt`) with 15-minute expiration.
- **Privacy Sanitization:** Reporter emails and private details are stripped from public feeds (`GET /api/reports`, `GET /api/reports/:id`) unless the requester is the owner, an assigned officer, or an administrator.
- **Upload Hardening:** MIME validation, extension check rejecting executables, 15MB limit, and randomized filenames.
- **Authentication:** JWT Bearer tokens with configurable secret.

---

## 📡 REST API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Real health check verifying MongoDB Atlas connection, ping latency, and collection metrics |
| `GET` | `/api/system/status` | Public | System status, AI provider status, and engine statistics |
| `POST` | `/api/upload` | Optional | Secure file upload endpoint with MIME validation |
| `POST` | `/api/auth/register` | Public | Citizen registration (forces role to `citizen`) |
| `POST` | `/api/auth/login` | Public | User authentication and JWT token generation |
| `GET` | `/api/auth/me` | Bearer | Current user profile and unread notification count |
| `PATCH` | `/api/auth/profile` | Bearer | Update user profile details |
| `POST` | `/api/auth/forgot-password` | Public | Request secure 6-digit password reset code |
| `POST` | `/api/auth/reset-password` | Public | Reset password with verified 6-digit OTP |
| `GET` | `/api/policies` | Public | List policy documents with search and category filters |
| `GET` | `/api/policies/:id` | Public | Retrieve policy details and multilingual explanations |
| `POST` | `/api/policies/extract` | Bearer | Extract text from uploaded PDF/Image with OCR |
| `POST` | `/api/policies/upload` | Bearer | Upload and index official policy document |
| `POST` | `/api/policies/:id/explain` | Bearer | Generate multilingual explanation with Gemini AI |
| `POST` | `/api/policies/:id/ask` | Bearer | Grounded Q&A on policy document |
| `POST` | `/api/tts` | Optional | Regional voice explainer audio synthesis |
| `GET` | `/api/schemes` | Public | List government welfare schemes |
| `GET` | `/api/schemes/:id` | Public | Scheme details |
| `POST` | `/api/schemes/:id/check-eligibility` | Bearer | AI eligibility matcher with criteria breakdown |
| `POST` | `/api/schemes/:id/bookmark` | Bearer | Bookmark scheme |
| `DELETE` | `/api/schemes/:id/bookmark` | Bearer | Remove scheme bookmark |
| `POST` | `/api/reports` | Bearer | File civic complaint with image and multimodal AI triage |
| `GET` | `/api/reports` | Optional | Public reports feed (privacy-sanitized) |
| `GET` | `/api/reports/my` | Bearer | Citizen's own submitted reports |
| `GET` | `/api/reports/:id` | Optional | Report details with privacy controls |
| `PATCH` | `/api/reports/:id/status` | Officer/Admin | Update grievance resolution status |
| `POST` | `/api/reports/:id/comments` | Bearer | Add comment to report discussion |
| `PATCH` | `/api/reports/:id/assign` | Admin | Assign complaint to municipal officer |
| `POST` | `/api/fact-check/analyze` | Bearer | Fact-check claim and analyze image forensics |
| `GET` | `/api/fact-check` | Public | List verified claims |
| `GET` | `/api/fact-check/:id` | Public | Claim verification details |
| `GET` | `/api/applications` | Bearer | List public service application trackers |
| `POST` | `/api/applications` | Bearer | Create service application tracker |
| `PATCH` | `/api/applications/:id` | Bearer | Update application checklist progress |
| `DELETE` | `/api/applications/:id` | Bearer | Delete application tracker |
| `GET` | `/api/dashboard/citizen` | Bearer | Citizen personal metrics and nearby complaints |
| `GET` | `/api/dashboard/admin` | Officer/Admin | Municipal operations statistics and SLA breakdown |
| `GET` | `/api/dashboard/transparency` | Public | Transparency pulse and city-wide resolution rate |
| `GET` | `/api/notifications` | Bearer | User notifications |
| `PATCH` | `/api/notifications/:id/read` | Bearer | Mark notification as read |
| `POST` | `/api/notifications/mark-all-read` | Bearer | Mark all notifications as read |
| `GET` | `/api/bookmarks` | Bearer | User saved schemes and policies |
| `GET` | `/api/admin/users` | Admin | Citizen directory management |
| `PATCH` | `/api/admin/users/:id/role` | Admin | Update user role |
| `GET` | `/api/admin/audit-logs` | Officer/Admin | System audit log stream |

---

## 🌐 Deployment Architecture

### 1. Unified Full-Stack (Render / Docker / VM)
The repository is full-stack ready. `server.ts` compiles the Vite React frontend in production and mounts Express API routes.
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start` (or `tsx server.ts`)
- **Health Check Path:** `/api/health`

### 2. Standalone Frontend (Vercel) + Backend (Render)
- **Vercel Root:** Project root (`/`)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Frontend Environment Variable:** `VITE_API_BASE_URL=https://your-backend.onrender.com`
- `vercel.json` is provided for automatic SPA routing and API proxying.

### 3. Database (MongoDB Atlas)
- Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Network Access: Allow access from your deployment IP or `0.0.0.0/0`.
- Set connection string in `MONGODB_URI`.
- The database will auto-seed on first connection.
