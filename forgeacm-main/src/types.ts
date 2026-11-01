/**
 * CivicLens AI - Shared TypeScript Interfaces
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'citizen' | 'officer' | 'admin';
  state: string;
  city: string;
  preferredLanguage: string;
  occupation?: string;
  annualIncome?: number;
  category?: string;
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
  state: string;
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
  reportId: string;
  userId: string;
  userName: string;
  userEmail?: string;
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
  confidence: number;
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
  progress: number;
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
