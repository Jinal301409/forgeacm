# CIVICLENS AI — Understand. Verify. Act.
**AI-Powered Civic Intelligence & Digital Governance Platform**

CivicLens AI bridges the gap between citizens, public policies, government welfare schemes, and essential municipal public services.

---

## 🏛️ Platform Highlights

1. **AI Policy Intelligence Explainer**
   - Ingests complex government notifications, gazettes, and circulars.
   - Powered by official Google GenAI SDK (`gemini-3.8-flash`).
   - Generates simple-language explanations, key points, eligibility criteria, required documents, step-by-step guides, deadlines, and FAQs.
   - **Strict Citations Grounding:** Explicitly distinguishes between verbatim statutory provisions, AI practical interpretations, and unstated criteria.
   - Supports 6 languages: English, Hindi (हिन्दी), Gujarati (ગુજરાતી), Marathi (मराठी), Bengali (বাংলা), Tamil (தமிழ்).
   - Conversational follow-up Q&A strictly grounded in the document.

2. **Government Scheme Explorer & Eligibility Engine**
   - Searchable catalog across Healthcare, Housing, Agriculture, Education, Scholarships, Entrepreneurship, Women Welfare, and Small Businesses.
   - AI Eligibility Matcher compares citizen age, income, state, and category against published rules to evaluate qualification scores and actionable advice.
   - Direct links to official government submission portals.

3. **Multimodal Civic Grievance Triage & Interactive Map**
   - Citizens upload photo evidence and geocoded locations (with GPS pin integration).
   - Gemini multimodal AI triages the image and description to assess category, severity (Low, Medium, High, Critical), duplicate risks, suggested municipal department, and remediation actions.
   - Interactive OpenStreetMap (Leaflet) displaying color-coded severity markers with click-to-pin reporting.
   - Full status history timeline (`Submitted → Under Review → Assigned → In Progress → Resolved → Closed`).
   - Official communication comment threads between citizens and ward engineers.

4. **Fact Verification Engine**
   - Rigorously checks viral claims, WhatsApp forwards, and rumors against official government gazettes, Press Information Bureau (PIB) bulletins, and verified public databases.
   - Four distinct verdicts:
     - `Supported by evidence`
     - `Contradicted by evidence`
     - `Misleading or missing context`
     - `Insufficient evidence`
   - Confidence percentage and official source citations.

5. **Public Service Application Assistant**
   - Guided step-by-step checklist tracker for public schemes (PM Surya Ghar Solar Subsidy, Ayushman Bharat Golden Card, Voter ID, Ration Card, etc.).

6. **Public Civic Transparency & Admin Operations**
   - Public Civic Pulse dashboard with anonymized ward resolution rates and SLA compliance.
   - Admin command desk: Complaint triage, officer dispatch, citizen directory with RBAC role updates, policy vault, operations analytics (Recharts), and cryptographic audit logs.

---

## 🔐 Demo Accounts (Pre-Seeded)

The application comes pre-seeded with 3 realistic accounts. You can sign in immediately using one-click demo buttons on the login page:

| Role | Email | Password | Responsibilities |
|---|---|---|---|
| **Administrator** | `admin@civiclens.gov` | `Admin@12345` | Complaint triage, officer dispatch, role management, audit logs |
| **Civic Officer** | `officer.sharma@civiclens.gov` | `Officer@12345` | Ward road/water engineering, status progression, dispatch notes |
| **Citizen** | `citizen.priya@civiclens.gov` | `Citizen@12345` | Grievance filing, scheme bookmarking, policy exploration |

---

## 🚀 Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, React Router, Recharts, Leaflet.
- **Backend:** Node.js, Express, TypeScript (`tsx`), JWT authentication, bcryptjs password hashing, Multer file upload.
- **Database:** Zero-config persistent disk-backed storage engine with MongoDB Atlas connection support (`MONGODB_URI`).
- **AI Engine:** Official Google GenAI SDK (`@google/genai`) using `gemini-3.8-flash`.

---

## ⚙️ Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# GEMINI_API_KEY: Required for Gemini AI policy analysis, triage, and fact checking
GEMINI_API_KEY="your-gemini-api-key"

# PORT: Server port (defaults to 3000)
PORT=3000

# JWT_SECRET: Secret for signing JWT tokens
JWT_SECRET="civiclens_super_secure_jwt_token_key_2025"

# MONGODB_URI: Optional MongoDB Atlas connection string
MONGODB_URI=""

# CLOUDINARY_URL: Optional cloud file storage URI
CLOUDINARY_URL=""
```

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Create citizen account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get current user session
- `PATCH /api/auth/profile` — Update demographic profile
- `POST /api/auth/reset-password` — Password reset

### Policies
- `GET /api/policies` — List cataloged policies with category and keyword filters
- `GET /api/policies/:id` — Get policy detail and saved multilingual explanations
- `POST /api/policies/upload` — Upload new official notification / gazette
- `POST /api/policies/:id/explain` — Run Gemini 3.8 Flash policy analysis with citations
- `POST /api/policies/:id/ask` — Follow-up grounded Q&A chat

### Schemes
- `GET /api/schemes` — Search schemes by category, state, and keyword
- `GET /api/schemes/:id` — Get scheme benefits and criteria
- `POST /api/schemes/:id/check-eligibility` — Run Gemini AI eligibility comparison
- `POST /api/schemes/:id/bookmark` — Bookmark scheme

### Civic Grievances
- `POST /api/reports` — Submit grievance with photo and location (runs Gemini multimodal triage)
- `GET /api/reports` — List public grievances (anonymized)
- `GET /api/reports/:id` — Get report timeline and comments
- `PATCH /api/reports/:id/status` — Officer/admin update status and resolution notes
- `POST /api/reports/:id/comments` — Add comment to report thread
- `PATCH /api/reports/:id/assign` — Admin assign report to officer

### Fact Verification
- `POST /api/fact-check/analyze` — Run Gemini fact verification on text/image
- `GET /api/fact-check` — List verified public claims

### System & Health
- `GET /api/system/status` — Health check, database engine status, and storage metrics
- `GET /api/dashboard/transparency` — Public civic pulse aggregated metrics
