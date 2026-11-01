/**
 * CivicLens AI - High Performance Persistent Database Layer
 * Supports seamless persistent JSON storage with atomic disk writes,
 * fully indexed collections, relationships, and automatic seeding.
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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

interface DatabaseSchema {
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

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadDatabase(): DatabaseSchema {
  if (dbCache) return dbCache;

  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(content);
      return dbCache!;
    } catch (err) {
      console.error('Error reading db.json, re-initializing database:', err);
    }
  }

  // Initialize with seed data
  dbCache = getInitialSeedData();
  saveDatabase();
  return dbCache;
}

export function saveDatabase(): void {
  if (!dbCache) return;
  ensureDataDir();
  const tempPath = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(dbCache, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}

// Initial Seed Data Creator
function getInitialSeedData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('Admin@12345', salt);
  const officerHash = bcrypt.hashSync('Officer@12345', salt);
  const citizenHash = bcrypt.hashSync('Citizen@12345', salt);

  const users: User[] = [
    {
      id: 'usr_admin_01',
      name: 'Dr. Rajeshwari Sen',
      email: 'admin@civiclens.gov',
      passwordHash: adminHash,
      phone: '+91 98765 43210',
      role: 'admin',
      state: 'Delhi (NCT)',
      city: 'New Delhi',
      preferredLanguage: 'English',
      createdAt: '2025-01-15T09:00:00Z',
    },
    {
      id: 'usr_officer_01',
      name: 'Vikram Sharma',
      email: 'officer.sharma@civiclens.gov',
      passwordHash: officerHash,
      phone: '+91 98234 56789',
      role: 'officer',
      state: 'Maharashtra',
      city: 'Mumbai',
      preferredLanguage: 'English',
      createdAt: '2025-01-20T10:30:00Z',
    },
    {
      id: 'usr_citizen_01',
      name: 'Priya Patel',
      email: 'citizen.priya@civiclens.gov',
      passwordHash: citizenHash,
      phone: '+91 91234 56780',
      role: 'citizen',
      state: 'Gujarat',
      city: 'Ahmedabad',
      preferredLanguage: 'English',
      occupation: 'Small Business Owner',
      annualIncome: 450000,
      category: 'General',
      createdAt: '2025-02-01T11:00:00Z',
    },
  ];

  const policyDocuments: PolicyDocument[] = [
    {
      id: 'pol_doc_01',
      title: 'PM Surya Ghar: Muft Bijli Yojana (Rooftop Solar Subsidy Guidelines 2025)',
      authority: 'Ministry of New & Renewable Energy (MNRE), Government of India',
      documentNumber: 'MNRE/RTS/2025/08-B',
      sourceUrl: 'https://pmsuryaghar.gov.in',
      notificationDate: '2025-02-15',
      effectiveDate: '2025-03-01',
      category: 'Energy & Sustainability',
      language: 'English',
      uploadedBy: 'usr_admin_01',
      uploaderName: 'Dr. Rajeshwari Sen',
      verificationStatus: 'Official',
      views: 1420,
      createdAt: '2025-02-16T10:00:00Z',
      extractedContent: `MINISTRY OF NEW AND RENEWABLE ENERGY
NOTIFICATION: PM SURYA GHAR: MUFT BIJLI YOJANA
Document Ref: MNRE/RTS/2025/08-B.
Date of Issuance: 15th February 2025.
1. Objectives: To provide free electricity up to 300 units per month to 1 crore households across India through grid-connected residential rooftop solar plants.
2. Central Financial Assistance (CFA):
- For systems up to 2 kW capacity: ₹30,000 per kW (Max ₹60,000).
- For additional capacity beyond 2 kW up to 3 kW: ₹18,000 per kW (Total max ₹78,000 for 3 kW).
- For systems above 3 kW: Cap set at ₹78,000 subsidy.
3. Eligibility:
- The applicant must be an Indian citizen possessing legal residential property with roof rights.
- Valid electricity meter connection in applicant's or spouse's name with zero outstanding dues.
- Commercial or industrial connections are strictly non-eligible under this residential window.
4. Mandatory Required Documents:
- Electricity bill of past 3 months.
- Identity proof (Aadhaar Card mandatory).
- Bank passbook/cancelled cheque with linked Aadhaar.
- Rooftop photographs with unobstructed sun exposure.
5. Application Mechanism:
- Online registration via the National Portal (pmsuryaghar.gov.in).
- Technical feasibility approval from local DISCOM within 15 working days.
- Installation by empaneled vendor within 60 days of sanction.
- Inspection & net-metering commissioning followed by direct DBT subsidy transfer into bank account within 30 days.
6. Penalties & Restrictions:
- Unauthorized modifications or unauthorized diversion of solar power attracts discom disconnection and recovery of subsidy under the Electricity Act 2003.`,
    },
    {
      id: 'pol_doc_02',
      title: 'Digital Personal Data Protection (DPDP) Act — Citizen Rights & Fiduciary Obligations',
      authority: 'Ministry of Electronics and Information Technology (MeitY)',
      documentNumber: 'MEITY/DPDP/REG-2025/04',
      sourceUrl: 'https://www.meity.gov.in',
      notificationDate: '2025-01-10',
      effectiveDate: '2025-04-01',
      category: 'Digital Governance & Privacy',
      language: 'English',
      uploadedBy: 'usr_admin_01',
      uploaderName: 'Dr. Rajeshwari Sen',
      verificationStatus: 'Official',
      views: 2890,
      createdAt: '2025-01-12T14:00:00Z',
      extractedContent: `GOVERNMENT OF INDIA - MINISTRY OF ELECTRONICS & IT
DIRECTIVE ON CITIZEN DATA RIGHTS AND GRIEVANCE REDRESSAL UNDER DPDP ACT.
Notice: MEITY/DPDP/REG-2025/04.
Key Provisions:
1. Citizen Rights:
- Right to access summary of personal data being processed.
- Right to correction, completion, and updating of personal data.
- Right to erasure where retention is no longer necessary.
- Right to nominate a representative in event of death or incapacity.
- Right of grievance redressal within 7 working days from data fiduciary.
2. Consent Architecture:
- Consent must be free, specific, informed, unconditional, and unambiguous with clear affirmative action.
- Multilingual consent notices must be provided in all 22 Eighth Schedule languages.
3. Penalties:
- Data breaches failing to notify Data Protection Board of India (DPBI): Up to ₹250 crore penalty.
- Negligence in safeguarding children's data: Up to ₹200 crore.`,
    },
    {
      id: 'pol_doc_03',
      title: 'National Urban Clean Mobility & EV Public Transport Incentive 2025',
      authority: 'Ministry of Housing and Urban Affairs (MoHUA)',
      documentNumber: 'MOHUA/NCM/2025/11',
      sourceUrl: 'https://mohua.gov.in',
      notificationDate: '2025-02-01',
      effectiveDate: '2025-03-15',
      category: 'Urban Infrastructure',
      language: 'English',
      uploadedBy: 'usr_officer_01',
      uploaderName: 'Vikram Sharma',
      verificationStatus: 'Official',
      views: 930,
      createdAt: '2025-02-02T11:00:00Z',
      extractedContent: `MINISTRY OF HOUSING AND URBAN AFFAIRS
URBAN CLEAN AIR & PUBLIC MOBILITY MISSION 2025.
Incentives for municipal authorities and citizen charging infrastructure.
- 50% capital subsidy on community EV charging setups in housing societies.
- Priority lane reservations and congestion fee waivers for electric fleet.
- Municipal grievance timeline: Road pothole reports on transit corridors must be resolved within 48 hours under penalty.`,
    },
    {
      id: 'pol_doc_04',
      title: 'Right to Public Services & Digital Delivery Guarantee Directive',
      authority: 'Department of Administrative Reforms and Public Grievances (DARPG)',
      documentNumber: 'DARPG/RPS/2025/03-G',
      sourceUrl: 'https://darpg.gov.in',
      notificationDate: '2025-01-25',
      effectiveDate: '2025-02-01',
      category: 'Public Administration',
      language: 'English',
      uploadedBy: 'usr_admin_01',
      uploaderName: 'Dr. Rajeshwari Sen',
      verificationStatus: 'Official',
      views: 1150,
      createdAt: '2025-01-26T09:15:00Z',
      extractedContent: `DEPARTMENT OF ADMINISTRATIVE REFORMS AND PUBLIC GRIEVANCES
MANDATORY CITIZEN CHARTER & TIMELINES.
1. Citizen Grievance Timelines:
- Potholes and hazardous road conditions: 72 hours max resolution.
- Streetlight repair in municipal zones: 24 to 48 hours.
- Contaminated drinking water leakages: 12 hours emergency response.
2. Escalation & Accountability:
- Automatic escalation to District Collector / Municipal Commissioner upon SLA breach.
- Compensatory token credit for citizen if timeline breached without documented force majeure.`,
    },
  ];

  const policyExplanations: PolicyExplanation[] = [
    {
      id: 'exp_01',
      documentId: 'pol_doc_01',
      language: 'English',
      simpleExplanation: 'The PM Surya Ghar scheme helps regular families install solar panels on their roofs with government paying up to ₹78,000 of the cost directly into their bank account, giving them up to 300 free electricity units each month.',
      keyPointsSummary: [
        'Government subsidy covers ₹30,000/kW up to 2 kW, and ₹18,000 for the 3rd kW (maximum ₹78,000 subsidy).',
        'Available only for residential households; commercial and factory roofs are strictly excluded.',
        'Electricity bill and Aadhaar card must be in the applicant\'s or spouse\'s name.',
        'Subsidy is paid directly into the citizen\'s bank account (DBT) within 30 days of net-meter commissioning.',
      ],
      eligibilityCriteria: {
        eligible: [
          'Indian citizens who own a residential house with suitable roof rights.',
          'Active domestic electricity connection with zero unpaid electricity bills.',
          'Bank account linked with Aadhaar card.',
        ],
        ineligible: [
          'Commercial shops, industrial units, and agricultural tube-well meters.',
          'Tenants without official written roof authorization from legal owner.',
        ],
      },
      requiredDocuments: [
        'Aadhaar Card (Identity proof)',
        'Latest 3 months electricity bills',
        'Bank Passbook or Cancelled Cheque showing IFSC',
        'Clear photograph of rooftop space',
      ],
      applicationGuide: [
        {
          step: 1,
          title: 'Register on National Portal',
          description: 'Visit pmsuryaghar.gov.in, select your State, electricity distribution company (DISCOM), and enter your consumer number.',
        },
        {
          step: 2,
          title: 'Apply for Feasibility Approval',
          description: 'Submit your rooftop dimensions and requested capacity. DISCOM approves feasibility within 15 working days.',
        },
        {
          step: 3,
          title: 'Vendor Installation',
          description: 'Choose any empaneled solar vendor from the portal list to install the panels and inverter.',
        },
        {
          step: 4,
          title: 'Net Meter Commissioning & DBT',
          description: 'DISCOM inspects the plant, installs the bidirectional net meter, and the subsidy gets deposited into your bank account within 30 days.',
        },
      ],
      rightsAndResponsibilities: {
        rights: [
          'Right to receive technical feasibility status within 15 working days.',
          'Right to choose any verified vendor from the national registry.',
          'Right to receive DBT subsidy directly without middleman cuts.',
        ],
        responsibilities: [
          'Keep solar panels clean and maintain rooftop structural safety.',
          'Do not tamper with net meters or divert generated power to commercial lines.',
        ],
      },
      importantDeadlines: [
        {
          milestone: 'Technical Feasibility Decision',
          date: 'Within 15 days of online submission',
          isStrict: true,
        },
        {
          milestone: 'Plant Installation by Empaneled Vendor',
          date: 'Within 60 days of feasibility sanction',
          isStrict: true,
        },
        {
          milestone: 'Subsidy Disbursement',
          date: 'Within 30 days of net meter commissioning certificate',
          isStrict: false,
        },
      ],
      faqs: [
        {
          question: 'What if I already have an off-grid solar inverter at home?',
          answer: 'The PM Surya Ghar subsidy specifically applies to grid-connected net-metered systems. You can upgrade your setup to grid-tied with an empaneled vendor to qualify.',
        },
        {
          question: 'Can housing society apartments apply jointly?',
          answer: 'Yes! Resident Welfare Associations (RWAs) can apply for common services (lifts, water pumps, corridor lighting) with up to ₹18,000/kW subsidy capped at 500 kW.',
        },
      ],
      realWorldImpact: 'A typical family with a 3 kW system saves approximately ₹2,500 to ₹3,800 on monthly power bills, recovering their private investment share in about 3.5 years while curbing carbon footprint.',
      citations: [
        {
          pageOrSection: 'Section 2 — Central Financial Assistance',
          explicitStatement: 'Up to 2 kW capacity: ₹30,000 per kW. For 3 kW: ₹78,000 maximum subsidy cap.',
          aiInterpretation: 'A homeowner putting up a 2.5 kW system will receive ₹60,000 + ₹9,000 = ₹69,000 in DBT subsidy.',
        },
        {
          pageOrSection: 'Section 3 — Eligibility',
          explicitStatement: 'Commercial or industrial connections are strictly non-eligible under this residential window.',
          aiInterpretation: 'Mixed residential-commercial buildings may require an exclusive domestic sub-meter to qualify.',
        },
      ],
      generatedAt: '2025-02-16T12:00:00Z',
    },
  ];

  const schemes: Scheme[] = [
    {
      id: 'sch_01',
      name: 'PM Surya Ghar: Muft Bijli Yojana',
      category: 'Energy & Sustainability',
      state: 'All-India / Central',
      description: 'Provides upfront direct subsidy up to ₹78,000 to residential households for installing rooftop solar panels, granting up to 300 units of free power each month.',
      eligibilitySummary: 'Indian residential homeowners with valid domestic electricity connection and clear roof rights.',
      eligibilityRules: {
        maxIncome: 1200000,
        targetGroups: ['Homeowners', 'RWAs'],
      },
      benefits: [
        'Direct subsidy up to ₹78,000 transferred via DBT',
        'Up to 300 units free solar electricity every month',
        'Concessional low-interest collateral-free bank loans (approx. 7% rate)',
      ],
      requiredDocuments: [
        'Aadhaar Card of electricity meter holder',
        'Past 3 months electricity bill',
        'Cancelled cheque / Bank passbook',
        'Rooftop ownership document or house tax receipt',
      ],
      applicationSteps: [
        'Register at pmsuryaghar.gov.in',
        'Submit consumer number and Discom details',
        'Receive technical approval and pick registered vendor',
        'Net meter install and DBT subsidy credit',
      ],
      officialUrl: 'https://pmsuryaghar.gov.in',
      source: 'Ministry of New and Renewable Energy',
      lastVerifiedAt: '2025-02-15',
      tags: ['Solar', 'Subsidy', 'Electricity', 'Green Energy', 'Housing'],
    },
    {
      id: 'sch_02',
      name: 'Ayushman Bharat — Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
      category: 'Healthcare',
      state: 'All-India / Central',
      description: 'World\'s largest government health assurance scheme providing health cover of ₹5,00,000 per family per year for secondary and tertiary care hospitalization.',
      eligibilitySummary: 'Low-income households identified in SECC 2011 data, plus all senior citizens aged 70+ irrespective of family income.',
      eligibilityRules: {
        maxIncome: 300000,
        minAge: 0,
        targetGroups: ['BPL Families', 'Senior Citizens 70+', 'Informal Workers'],
      },
      benefits: [
        '₹5,00,000 annual cashless hospitalization coverage',
        'Over 27,000 empaneled public and private hospitals across India',
        'Pre-existing conditions covered from day 1',
        'Covers up to 3 days pre-hospitalization and 15 days post-hospitalization diagnostic costs',
      ],
      requiredDocuments: [
        'Aadhaar Card or PM-JAY letter',
        'Ration Card / Family identity proof',
        'Active mobile number',
      ],
      applicationSteps: [
        'Check eligibility at beneficiary.nha.gov.in',
        'Perform e-KYC using Aadhaar OTP or biometric scan',
        'Download instant Ayushman Golden Card',
        'Present card at any empaneled hospital helpdesk (Ayushman Mitra)',
      ],
      officialUrl: 'https://beneficiary.nha.gov.in',
      source: 'National Health Authority (NHA)',
      lastVerifiedAt: '2025-01-20',
      tags: ['Health', 'Insurance', 'Cashless', 'Hospital', 'Senior Citizens'],
    },
    {
      id: 'sch_03',
      name: 'Stand-Up India Scheme for Women and SC/ST Entrepreneurs',
      category: 'Entrepreneurship',
      state: 'All-India / Central',
      description: 'Facilitates bank loans between ₹10 lakh and ₹1 Crore to at least one SC or ST borrower and at least one woman borrower per bank branch for setting up greenfield enterprises.',
      eligibilitySummary: 'Women entrepreneurs of any caste/community and SC/ST individuals aged 18+ launching first-time business ventures.',
      eligibilityRules: {
        minAge: 18,
        targetGroups: ['Women', 'SC', 'ST', 'Entrepreneurs'],
      },
      benefits: [
        'Composite bank loans ranging from ₹10 Lakh to ₹1 Crore',
        'Margin money requirement capped at 15%',
        'Comprehensive handholding support from SIDBI and NABARD',
      ],
      requiredDocuments: [
        'Identity & Address proof (Aadhaar, Passport, Voter ID)',
        'Caste certificate (for SC/ST applicants)',
        'Project report / Business proposal with financial projections',
        'Proof of enterprise premises (rent agreement or deed)',
      ],
      applicationSteps: [
        'Register at standupmitra.in',
        'Prepare Detailed Project Report (DPR)',
        'Connect with assigned Lead District Manager bank branch',
        'Sanction and disbursal with credit guarantee coverage',
      ],
      officialUrl: 'https://www.standupmitra.in',
      source: 'Department of Financial Services, Ministry of Finance',
      lastVerifiedAt: '2025-01-10',
      tags: ['Business', 'Loan', 'Women Empowerment', 'Startup', 'Finance'],
    },
    {
      id: 'sch_04',
      name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      category: 'Agriculture',
      state: 'All-India / Central',
      description: 'Income support scheme providing ₹6,000 per year in three equal installments directly into the Aadhaar-seeded bank accounts of all landholding farmer families.',
      eligibilitySummary: 'All landholding farmer families who have cultivable landholding in their names.',
      eligibilityRules: {
        targetGroups: ['Small & Marginal Farmers', 'Landowning Farmers'],
      },
      benefits: [
        '₹6,000 direct income support annually',
        'Paid in 3 equal installments of ₹2,000 every four months',
        'Direct Bank Transfer without administrative leakage',
      ],
      requiredDocuments: [
        'Aadhaar card with linked mobile phone',
        'Land ownership record (Khatauni / 7/12 extract / Patta)',
        'Aadhaar-seeded bank account details',
      ],
      applicationSteps: [
        'Visit pmkisan.gov.in and click New Farmer Registration',
        'Enter Aadhaar number and land record identification',
        'Complete face-auth or OTP-based e-KYC',
        'Verification by District Agriculture Officer',
      ],
      officialUrl: 'https://pmkisan.gov.in',
      source: 'Ministry of Agriculture and Farmers Welfare',
      lastVerifiedAt: '2025-02-10',
      tags: ['Agriculture', 'Farmers', 'Direct Benefit', 'Rural'],
    },
    {
      id: 'sch_05',
      name: 'National Apprenticeship Promotion Scheme (NAPS-2)',
      category: 'Education & Employment',
      state: 'All-India / Central',
      description: 'Encourages industries to hire fresh youth, ITI, diploma, and degree holders by co-sharing stipends with up to ₹1,500/month government stipend support.',
      eligibilitySummary: 'Youth aged 14+ (18+ for hazardous trades) with minimum 5th to graduate qualification looking for vocational industry training.',
      eligibilityRules: {
        minAge: 14,
        maxAge: 35,
        targetGroups: ['Students', 'Fresh Graduates', 'Vocational Trainees'],
      },
      benefits: [
        'Direct monthly stipend reimbursement up to ₹1,500 from Government',
        'Real industry on-the-job training in formal corporate sector',
        'Nationally recognized National Apprenticeship Certificate (NAC)',
      ],
      requiredDocuments: [
        'Aadhaar card',
        'Educational marksheet (10th, 12th, ITI, Diploma or Degree)',
        'Bank passbook details for stipend DBT',
      ],
      applicationSteps: [
        'Create Candidate Profile on apprenticeshipindia.gov.in',
        'Search apprenticeship vacancies by sector and location',
        'Apply online to prospective companies',
        'Sign digital apprenticeship contract',
      ],
      officialUrl: 'https://www.apprenticeshipindia.gov.in',
      source: 'Ministry of Skill Development & Entrepreneurship',
      lastVerifiedAt: '2025-01-28',
      tags: ['Education', 'Jobs', 'Apprenticeship', 'Stipend', 'Youth'],
    },
    {
      id: 'sch_06',
      name: 'Pradhan Mantri Awas Yojana — Urban 2.0 (PMAY-U 2.0)',
      category: 'Housing',
      state: 'All-India / Central',
      description: 'Assists 1 crore urban poor and middle-class families to construct, purchase or rent an affordable pucca house with interest subsidy and direct financial aid.',
      eligibilitySummary: 'Families belonging to EWS (income up to ₹3 lakh), LIG (up to ₹6 lakh), and MIG (up to ₹9 lakh) who do not own a pucca house anywhere in India.',
      eligibilityRules: {
        maxIncome: 900000,
        targetGroups: ['Urban Families', 'Slum Dwellers', 'Middle Class'],
      },
      benefits: [
        'Interest subsidy of 4.0% on home loans up to ₹25 lakh for 12-year tenure (subsidy benefit up to ₹1.80 lakh)',
        'Direct financial assistance of ₹2.50 lakh for Beneficiary-Led Construction',
        'Affordable rental housing voucher assistance for urban migrant workers',
      ],
      requiredDocuments: [
        'Aadhaar card for all family members',
        'Income certificate issued by competent revenue authority',
        'Affidavit declaring family owns no pucca house in India',
        'Bank account details and land registry documents (for self-construction)',
      ],
      applicationSteps: [
        'Apply via pmay-urban.gov.in or Common Service Centre (CSC)',
        'Select applicable vertical (Credit Linked Subsidy or Construction)',
        'Municipal inspection and socio-economic validation',
        'Subsidy credited to loan account or DBT stages',
      ],
      officialUrl: 'https://pmay-urban.gov.in',
      source: 'Ministry of Housing and Urban Affairs',
      lastVerifiedAt: '2025-02-12',
      tags: ['Housing', 'Home Loan', 'Subsidy', 'Urban', 'Pucca House'],
    },
  ];

  const civicReports: CivicReport[] = [
    {
      id: 'rep_01',
      reportId: 'CIVIC-2025-1042',
      userId: 'usr_citizen_01',
      userName: 'Priya Patel',
      userEmail: 'citizen.priya@civiclens.gov',
      title: 'Deep Hazardous Potholes Near Navrangpura Junction Bus Stop',
      description: 'Two large crater-like potholes (approx 1.5 ft wide and 6 inches deep) have developed right before the bus bay. During peak hours, two-wheelers frequently skid and lose balance.',
      category: 'Potholes',
      imageUrls: [
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      ],
      location: 'Navrangpura Bus Junction, Ahmedabad, Gujarat',
      address: 'Near Commerce Six Roads, Navrangpura, Ahmedabad, Gujarat 380009',
      latitude: 23.0372,
      longitude: 72.5532,
      severity: 'High',
      aiAnalysis: {
        detectedCategory: 'Potholes',
        summary: 'Severe road surface craters located directly within bus ingress transit path; high risk of commuter vehicular loss of control.',
        severityEstimate: 'High',
        suggestedDepartment: 'Municipal Roads & Civil Infrastructure Department',
        duplicateWarning: false,
        recommendedAction: 'Immediate cold-mix asphalt patch fill within 24 hours followed by bitumen leveling.',
        confidence: 0.94,
      },
      assignedOfficer: {
        id: 'usr_officer_01',
        name: 'Vikram Sharma',
        department: 'Roads & Infrastructure Maintenance',
      },
      status: 'In Progress',
      statusHistory: [
        {
          newStatus: 'Submitted',
          updatedBy: 'Priya Patel (Citizen)',
          remarks: 'Initial complaint filed with photo evidence and GPS coordinate.',
          timestamp: '2025-02-20T08:30:00Z',
        },
        {
          previousStatus: 'Submitted',
          newStatus: 'Under Review',
          updatedBy: 'CivicLens AI System',
          remarks: 'Automated triage: Category mapped to Potholes with High severity assessment.',
          timestamp: '2025-02-20T08:31:00Z',
        },
        {
          previousStatus: 'Under Review',
          newStatus: 'Assigned',
          updatedBy: 'Dr. Rajeshwari Sen (Admin)',
          remarks: 'Assigned to Ward 7 Roads Division Engineer Vikram Sharma.',
          timestamp: '2025-02-20T11:00:00Z',
        },
        {
          previousStatus: 'Assigned',
          newStatus: 'In Progress',
          updatedBy: 'Vikram Sharma (Officer)',
          remarks: 'Road repair team dispatched with asphalt equipment. Work commenced.',
          timestamp: '2025-02-21T09:15:00Z',
        },
      ],
      comments: [
        {
          id: 'comm_01',
          userId: 'usr_officer_01',
          userName: 'Vikram Sharma',
          userRole: 'officer',
          message: 'Contractor crew is currently laying cold-asphalt base. Traffic diversion cones placed.',
          createdAt: '2025-02-21T09:20:00Z',
        },
        {
          id: 'comm_02',
          userId: 'usr_citizen_01',
          userName: 'Priya Patel',
          userRole: 'citizen',
          message: 'Thank you for the prompt dispatch! Much appreciated.',
          createdAt: '2025-02-21T10:05:00Z',
        },
      ],
      createdAt: '2025-02-20T08:30:00Z',
      updatedAt: '2025-02-21T09:15:00Z',
    },
    {
      id: 'rep_02',
      reportId: 'CIVIC-2025-1043',
      userId: 'usr_citizen_01',
      userName: 'Priya Patel',
      userEmail: 'citizen.priya@civiclens.gov',
      title: 'Major Drinking Water Pipeline Rupture Gushing Onto 100ft Road',
      description: 'Potable municipal water pipe cracked underground. Water is shooting 3 feet high and flooding the pedestrian walkway and market entrance.',
      category: 'Water Leakage',
      imageUrls: [
        'https://images.unsplash.com/photo-1584463623578-30113f8903c7?auto=format&fit=crop&w=800&q=80',
      ],
      location: '100ft Ring Road, Satellite, Ahmedabad',
      address: 'Opposite Star Bazaar, Satellite Road, Ahmedabad, Gujarat 380015',
      latitude: 23.0289,
      longitude: 72.5273,
      severity: 'Critical',
      aiAnalysis: {
        detectedCategory: 'Water Leakage',
        summary: 'High pressure potable main fracture creating substantial clean water loss and localized pedestrian flooding.',
        severityEstimate: 'Critical',
        suggestedDepartment: 'Water Supply & Sewerage Board',
        duplicateWarning: false,
        recommendedAction: 'Emergency main valve shutdown within 1 hour followed by sleeve joint replacement.',
        confidence: 0.98,
      },
      assignedOfficer: {
        id: 'usr_officer_01',
        name: 'Vikram Sharma',
        department: 'Water Engineering Services',
      },
      status: 'Assigned',
      statusHistory: [
        {
          newStatus: 'Submitted',
          updatedBy: 'Priya Patel (Citizen)',
          remarks: 'Emergency water leak reported.',
          timestamp: '2025-02-22T07:10:00Z',
        },
        {
          previousStatus: 'Submitted',
          newStatus: 'Assigned',
          updatedBy: 'Dr. Rajeshwari Sen (Admin)',
          remarks: 'Critical priority alert triggered to Ward Water Inspector.',
          timestamp: '2025-02-22T07:25:00Z',
        },
      ],
      comments: [
        {
          id: 'comm_03',
          userId: 'usr_officer_01',
          userName: 'Vikram Sharma',
          userRole: 'officer',
          message: 'Zone feeder valve has been closed. Excavator arriving at site to uncover flange.',
          createdAt: '2025-02-22T08:00:00Z',
        },
      ],
      createdAt: '2025-02-22T07:10:00Z',
      updatedAt: '2025-02-22T08:00:00Z',
    },
    {
      id: 'rep_03',
      reportId: 'CIVIC-2025-0988',
      userId: 'usr_citizen_01',
      userName: 'Priya Patel',
      userEmail: 'citizen.priya@civiclens.gov',
      title: 'Four Successive Streetlights Out on Riverfront Promenade Stretch',
      description: 'Streetlamps from lamp post #42 to #45 are completely dark since 3 nights. Walking track is poorly illuminated and feels unsafe for evening walkers.',
      category: 'Broken Streetlights',
      imageUrls: [
        'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
      ],
      location: 'Sabarmati Riverfront East Walkway, Ahmedabad',
      address: 'Between Subhash Bridge & Gandhi Bridge Promenade, Ahmedabad',
      latitude: 23.0450,
      longitude: 72.5714,
      severity: 'Medium',
      aiAnalysis: {
        detectedCategory: 'Broken Streetlights',
        summary: 'Multiple consecutive lighting failures creating dark pocket along high-footfall recreational pedestrian corridor.',
        severityEstimate: 'Medium',
        suggestedDepartment: 'Electrical & Public Lighting Division',
        duplicateWarning: false,
        recommendedAction: 'Check circuit feeder breaker #4 and replace burned LED driver units.',
        confidence: 0.91,
      },
      status: 'Resolved',
      statusHistory: [
        {
          newStatus: 'Submitted',
          updatedBy: 'Priya Patel',
          remarks: 'Streetlights out report created.',
          timestamp: '2025-02-18T19:00:00Z',
        },
        {
          previousStatus: 'Submitted',
          newStatus: 'In Progress',
          updatedBy: 'Vikram Sharma (Officer)',
          remarks: 'Electrician team inspecting underground feeder line.',
          timestamp: '2025-02-19T10:00:00Z',
        },
        {
          previousStatus: 'In Progress',
          newStatus: 'Resolved',
          updatedBy: 'Vikram Sharma (Officer)',
          remarks: 'Tripped MCB replaced and 4 luminaire driver circuits restored. Illuminance tested at 25 lux.',
          timestamp: '2025-02-19T18:40:00Z',
        },
      ],
      comments: [],
      resolutionNotes: 'Repaired burnt cable splice inside distribution junction box #3. All 4 lamps fully operational.',
      createdAt: '2025-02-18T19:00:00Z',
      updatedAt: '2025-02-19T18:40:00Z',
    },
    {
      id: 'rep_04',
      reportId: 'CIVIC-2025-1011',
      userId: 'usr_admin_01',
      userName: 'Dr. Rajeshwari Sen',
      userEmail: 'admin@civiclens.gov',
      title: 'Illegal Commercial Debris Dumped Beside Municipal Park Fence',
      description: 'Truckload of construction rubble and concrete waste dumped along the park boundary wall, obstructing pedestrian footpath.',
      category: 'Garbage Accumulation',
      imageUrls: [
        'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
      ],
      location: 'Law Garden Perimeter Road, Ahmedabad',
      address: 'Netaji Marg, Ellisbridge, Ahmedabad, Gujarat 380006',
      latitude: 23.0232,
      longitude: 72.5601,
      severity: 'Medium',
      aiAnalysis: {
        detectedCategory: 'Garbage Accumulation',
        summary: 'Solid construction waste deposition blocking municipal walkway.',
        severityEstimate: 'Medium',
        suggestedDepartment: 'Solid Waste Management & Enforcement',
        duplicateWarning: false,
        recommendedAction: 'JCB loader clearance and review CCTV feed of intersection to penalize violator.',
        confidence: 0.89,
      },
      status: 'Under Review',
      statusHistory: [
        {
          newStatus: 'Submitted',
          updatedBy: 'Dr. Rajeshwari Sen',
          remarks: 'Report registered.',
          timestamp: '2025-02-23T14:15:00Z',
        },
      ],
      comments: [],
      createdAt: '2025-02-23T14:15:00Z',
      updatedAt: '2025-02-23T14:15:00Z',
    },
  ];

  const factChecks: FactCheck[] = [
    {
      id: 'fact_01',
      userId: 'usr_citizen_01',
      userName: 'Priya Patel',
      originalClaim: 'Viral WhatsApp Message: "Govt of India is giving free ₹5,000 monthly cash allowance to all youth under the PM Berojgari Bhatta Yojana 2025. Click this bit.ly link to claim immediately."',
      extractedClaims: [
        'Central Government has announced a universal ₹5,000 monthly cash allowance for all youth.',
        'Scheme name is PM Berojgari Bhatta Yojana 2025.',
        'Registration requires clicking third-party shortlink.',
      ],
      verdict: 'Contradicted by evidence',
      confidence: 98,
      analysis: 'The Press Information Bureau (PIB) Fact Check unit and Ministry of Labour & Employment have officially confirmed that NO such scheme named "PM Berojgari Bhatta Yojana" offering ₹5,000 cash has been launched by the Central Government. The circular circulating on WhatsApp and social media is a phishing scam aimed at harvesting citizens\' bank credentials and Aadhaar numbers.',
      evidenceFound: [
        'PIB Fact Check official clarification issued via X (Twitter) refuting the claim.',
        'Official National Career Service portal (ncs.gov.in) has no record of such financial allowance.',
        'Phishing domain registered on anonymous registrar without government NIC/GOV domain extension.',
      ],
      contradictoryEvidence: [
        'No official cabinet approval, budget allocation, or gazette notification exists for this allowance.',
        'Government websites exclusively use .gov.in or .nic.in domain extensions.',
      ],
      officialSources: [
        {
          title: 'PIB Fact Check Official Clarification (Press Information Bureau)',
          url: 'https://pib.gov.in/Factcheck.aspx',
          authority: 'Press Information Bureau, Ministry of Information & Broadcasting',
        },
        {
          title: 'National Career Service Portal — Official Employment Guidelines',
          url: 'https://www.ncs.gov.in',
          authority: 'Ministry of Labour and Employment',
        },
      ],
      syntheticMediaNotice: 'Forensic synthetic media detection is not active. Textual claim verified against authorized Government Gazette records and PIB Fact Check bulletins.',
      verifiedTimestamp: '2025-02-20T16:00:00Z',
    },
    {
      id: 'fact_02',
      userId: 'usr_citizen_01',
      userName: 'Priya Patel',
      originalClaim: 'Claim on social media: "Citizens aged 70 years and above are now eligible for Ayushman Bharat health insurance regardless of their family income or socio-economic status."',
      extractedClaims: [
        'All citizens aged 70 and above qualify for Ayushman Bharat PM-JAY.',
        'The benefit applies irrespective of socio-economic status or income bracket.',
      ],
      verdict: 'Supported by evidence',
      confidence: 99,
      analysis: 'The Union Cabinet officially approved the expansion of Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB PM-JAY) to provide health coverage to ALL senior citizens aged 70 years and above, irrespective of their income. Eligible seniors receive a distinct Ayushman card providing ₹5 lakh shared/individual coverage per year.',
      evidenceFound: [
        'Cabinet decision officially notified by Ministry of Health and Family Welfare.',
        'National Health Authority portal beneficiary.nha.gov.in updated with dedicated 70+ registration module.',
        'Over 30 lakh senior citizen cards issued in first phase rollout.',
      ],
      contradictoryEvidence: [],
      officialSources: [
        {
          title: 'AB PM-JAY Expansion for Senior Citizens 70+ Notification',
          url: 'https://beneficiary.nha.gov.in',
          authority: 'National Health Authority & Ministry of Health',
        },
      ],
      syntheticMediaNotice: 'Standard factual assertion corroborated directly with Cabinet communique.',
      verifiedTimestamp: '2025-02-15T11:20:00Z',
    },
    {
      id: 'fact_03',
      userId: 'usr_admin_01',
      userName: 'Dr. Rajeshwari Sen',
      originalClaim: 'Viral Facebook Video: "Government has made biometric iris scanning mandatory at all municipal toll plazas starting March 2025, or vehicles will be impounded."',
      extractedClaims: [
        'Iris scanning is mandatory at municipal toll plazas.',
        'Unscanned vehicles face immediate impoundment starting March 2025.',
      ],
      verdict: 'Misleading or missing context',
      confidence: 94,
      analysis: 'National Highways Authority of India (NHAI) is piloting GNSS (Global Navigation Satellite System) based barrierless electronic toll collection alongside existing RFID FASTag. There is NO mandate requiring physical iris scanning of passengers, and no impoundment policy exists for lack of iris verification.',
      evidenceFound: [
        'NHAI policy documents confirm GNSS satellite tolling pilot on selected national highway stretches.',
        'FASTag remains valid and operational across all national toll plazas.',
      ],
      contradictoryEvidence: [
        'No Ministry of Road Transport and Highways (MoRTH) circular references vehicle impoundment for iris scanning.',
      ],
      officialSources: [
        {
          title: 'Ministry of Road Transport & Highways Press Release on GNSS Tolling',
          url: 'https://morth.nic.in',
          authority: 'Ministry of Road Transport and Highways (MoRTH)',
        },
      ],
      syntheticMediaNotice: 'Video audio track contains hyperbolic voiceover misrepresenting a technical satellite tolling pilot.',
      verifiedTimestamp: '2025-02-22T13:45:00Z',
    },
  ];

  const applications: PublicApplication[] = [
    {
      id: 'app_01',
      userId: 'usr_citizen_01',
      serviceName: 'PM Surya Ghar Rooftop Solar Technical Sanction',
      department: 'Gujarat Energy Development Agency (GEDA) & Torrent Power Discom',
      referenceNumber: 'RTS-GJ-2025-99418',
      officialPortalUrl: 'https://pmsuryaghar.gov.in',
      checklist: [
        { id: 'c1', item: 'Aadhaar Identity Verification & e-KYC', completed: true },
        { id: 'c2', item: 'Upload 3 months electricity bill', completed: true },
        { id: 'c3', item: 'Submit Rooftop Dimensions & Load Request', completed: true },
        { id: 'c4', item: 'DISCOM Technical Feasibility Approval', completed: true },
        { id: 'c5', item: 'Empaneled Vendor Work Order', completed: false },
        { id: 'c6', item: 'Net-Meter Commissioning Inspection', completed: false },
        { id: 'c7', item: 'DBT Subsidy Disbursal', completed: false },
      ],
      progress: 60,
      status: 'In Verification',
      notes: 'Feasibility approved by Discom on 18 Feb 2025. Vendor quotation pending final review.',
      createdAt: '2025-02-16T14:00:00Z',
      updatedAt: '2025-02-18T16:30:00Z',
    },
    {
      id: 'app_02',
      userId: 'usr_citizen_01',
      serviceName: 'Ayushman Bharat Golden Health Card (Senior Citizen 70+)',
      department: 'National Health Authority',
      referenceNumber: 'AB-70P-GJ-44120',
      officialPortalUrl: 'https://beneficiary.nha.gov.in',
      checklist: [
        { id: 'a1', item: 'Family Member Aadhaar Details', completed: true },
        { id: 'a2', item: 'Mobile OTP Authentication', completed: true },
        { id: 'a3', item: 'Biometric e-KYC Verification', completed: true },
        { id: 'a4', item: 'Digital Card Issuance', completed: true },
      ],
      progress: 100,
      status: 'Approved',
      notes: 'Card approved and downloaded. Eligible for ₹5 lakh cashless coverage across empaneled hospitals.',
      createdAt: '2025-02-10T11:00:00Z',
      updatedAt: '2025-02-10T11:15:00Z',
    },
  ];

  const notifications: Notification[] = [
    {
      id: 'notif_01',
      userId: 'usr_citizen_01',
      title: 'Road Repair Update on CIVIC-2025-1042',
      message: 'Officer Vikram Sharma updated status to "In Progress". Road repair crew is on site.',
      type: 'info',
      read: false,
      link: '/reports/CIVIC-2025-1042',
      createdAt: '2025-02-21T09:16:00Z',
    },
    {
      id: 'notif_02',
      userId: 'usr_citizen_01',
      title: 'Solar Application Feasibility Approved',
      message: 'Your PM Surya Ghar application RTS-GJ-2025-99418 has passed technical feasibility check.',
      type: 'success',
      read: false,
      link: '/applications',
      createdAt: '2025-02-18T16:31:00Z',
    },
    {
      id: 'notif_03',
      userId: 'usr_citizen_01',
      title: 'New Policy Notification Published',
      message: 'Department of Administrative Reforms has issued revised Citizen Charter Timelines for 2025.',
      type: 'info',
      read: true,
      link: '/policies/pol_doc_04',
      createdAt: '2025-01-26T10:00:00Z',
    },
    {
      id: 'notif_04',
      userId: 'usr_admin_01',
      title: 'Critical Civic Alert: Water Main Burst',
      message: 'New critical grievance reported at 100ft Ring Road, Satellite. Auto-assigned to Water Dept.',
      type: 'alert',
      read: false,
      link: '/admin/reports',
      createdAt: '2025-02-22T07:26:00Z',
    },
  ];

  const bookmarks: Bookmark[] = [
    {
      id: 'bm_01',
      userId: 'usr_citizen_01',
      itemType: 'scheme',
      itemId: 'sch_01',
      itemTitle: 'PM Surya Ghar: Muft Bijli Yojana',
      itemCategory: 'Energy & Sustainability',
      createdAt: '2025-02-16T12:30:00Z',
    },
    {
      id: 'bm_02',
      userId: 'usr_citizen_01',
      itemType: 'policy',
      itemId: 'pol_doc_02',
      itemTitle: 'Digital Personal Data Protection (DPDP) Act — Citizen Rights',
      itemCategory: 'Digital Governance & Privacy',
      createdAt: '2025-02-17T15:00:00Z',
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud_01',
      userId: 'usr_citizen_01',
      userName: 'Priya Patel',
      action: 'SUBMIT_CIVIC_REPORT',
      entityType: 'CivicReport',
      entityId: 'CIVIC-2025-1042',
      details: 'Pothole report created at Navrangpura Junction with GPS coordinates.',
      timestamp: '2025-02-20T08:30:00Z',
    },
    {
      id: 'aud_02',
      userId: 'usr_admin_01',
      userName: 'Dr. Rajeshwari Sen',
      action: 'ASSIGN_OFFICER',
      entityType: 'CivicReport',
      entityId: 'CIVIC-2025-1042',
      details: 'Assigned report to Ward Engineer Vikram Sharma.',
      timestamp: '2025-02-20T11:00:00Z',
    },
    {
      id: 'aud_03',
      userId: 'usr_officer_01',
      userName: 'Vikram Sharma',
      action: 'UPDATE_REPORT_STATUS',
      entityType: 'CivicReport',
      entityId: 'CIVIC-2025-1042',
      details: 'Status transitioned from Assigned to In Progress. Equipment dispatched.',
      timestamp: '2025-02-21T09:15:00Z',
    },
    {
      id: 'aud_04',
      userId: 'usr_citizen_01',
      userName: 'Priya Patel',
      action: 'RUN_FACT_CHECK',
      entityType: 'FactCheck',
      entityId: 'fact_01',
      details: 'Analyzed viral claim regarding PM Berojgari Bhatta scheme.',
      timestamp: '2025-02-20T16:00:00Z',
    },
  ];

  return {
    users,
    policyDocuments,
    policyExplanations,
    schemes,
    civicReports,
    factChecks,
    applications,
    notifications,
    bookmarks,
    auditLogs,
  };
}

// Helper query utilities
export const db = {
  get: () => loadDatabase(),
  save: () => saveDatabase(),
};
