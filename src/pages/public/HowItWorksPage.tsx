import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Database,
  Globe,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#38D9E6] px-3 py-1 rounded-full bg-[#38D9E6]/10 border border-[#38D9E6]/20">
          Methodology & Technology
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          How CivicLens AI Operates
        </h1>
        <p className="text-base text-slate-400 leading-relaxed">
          A transparent look under the hood: how our AI processes public gazettes, triages municipal complaints, and verifies claims with strict citation standards.
        </p>
      </div>

      {/* Workflow 1: AI Policy Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#477BFF]/10 text-[#477BFF] text-xs font-mono font-semibold border border-[#477BFF]/20">
            <FileText className="w-4 h-4" /> MODULE 01: POLICY INTELLIGENCE
          </div>
          <h2 className="text-2xl font-bold text-white">
            From Bureaucratic Gazette to Clear Citizen Entitlements
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Government circulars often exceed 50 pages of dense legal terminology. CivicLens ingests the full document, extracts clauses into a structured JSON schema, and translates each section into plain, actionable language.
          </p>

          <div className="space-y-2.5 text-xs text-slate-300 pt-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Clause Extraction: Identifies eligibility, deadlines, financial subsidies, and penalties.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-Language Synthesis: Generates instant translations in 6 Indian languages.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Explicit Separation: Never merges legal facts with synthetic assumptions.</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="glass-card p-6 rounded-2xl border border-white/[0.1] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/[0.08]">
              <span>Ingested Document: Gazette No. 248</span>
              <span className="text-[#38D9E6]">Structured Schema</span>
            </div>
            <div className="text-slate-400 space-y-1">
              <p><span className="text-emerald-400">1. Subsidies:</span> Direct DBT ₹30,000/kW up to 2 kW</p>
              <p><span className="text-blue-400">2. Exclusions:</span> Commercial meters strictly ineligible</p>
              <p><span className="text-amber-400">3. Feasibility:</span> DISCOM decision SLA within 15 working days</p>
              <p><span className="text-purple-400">4. Grounding:</span> Clause 4(b), Page 7, MNRE Guidelines</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow 2: Grievance Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 border-t border-white/[0.08]">
        <div className="lg:col-span-6 order-2 lg:order-1">
          <div className="glass-card p-6 rounded-2xl border border-white/[0.1] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/[0.08]">
              <span>Citizen Photo Evidence</span>
              <span className="text-orange-400">Multimodal Triage</span>
            </div>
            <div className="text-slate-400 space-y-1">
              <p><span className="text-white">Detected Category:</span> Potholes & Surface Cavity</p>
              <p><span className="text-orange-400">Severity Assessment:</span> High (Direct commuter hazard)</p>
              <p><span className="text-[#38D9E6]">Routing Target:</span> Ward 7 Civil Works & Asphalt Division</p>
              <p><span className="text-emerald-400">SLA Mandate:</span> Max 72 hours for temporary cold-patch fill</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-mono font-semibold border border-orange-500/20">
            <AlertCircle className="w-4 h-4" /> MODULE 02: MULTIMODAL GRIEVANCE TRIAGE
          </div>
          <h2 className="text-2xl font-bold text-white">
            Visual Inspection & Time-Bound Municipal Accountability
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Citizens snap a photo of damaged municipal infrastructure. Gemini 3.8 assesses the visual risk level, estimates depth and commuter peril, suggests the exact municipal division, and prevents duplicate logs.
          </p>

          <div className="space-y-2.5 text-xs text-slate-300 pt-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Geocoded Pinpoint: Records latitude and longitude for field repair crew GPS navigation.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automated Officer Dispatch: Alerts ward engineers with digital work orders.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Public SLA Progress: Updates citizens at each stage: Under Review, Assigned, In Progress, Resolved.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow 3: Fact Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 border-t border-white/[0.08]">
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#8968FF]/10 text-[#8968FF] text-xs font-mono font-semibold border border-[#8968FF]/20">
            <ShieldCheck className="w-4 h-4" /> MODULE 03: FACT VERIFICATION
          </div>
          <h2 className="text-2xl font-bold text-white">
            Objective Claim Verification Against Authorized Repositories
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Viral WhatsApp forwards and speculative rumors spread rapidly. Our engine breaks claims into checkable propositions, checks authoritative gazette data and PIB press notices, and yields an honest verdict with source citations.
          </p>
        </div>

        <div className="lg:col-span-6">
          <div className="glass-card p-6 rounded-2xl border border-white/[0.1] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/[0.08]">
              <span>Viral Claim Analysis</span>
              <span className="text-rose-400">Verdict Evaluation</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <p><strong className="text-white">Verdicts:</strong> Supported, Contradicted, Misleading, Insufficient</p>
              <p><strong className="text-white">Evidence:</strong> Cross-checks domain authenticity (e.g. .gov.in vs phishing)</p>
              <p><strong className="text-white">Notice:</strong> Synthetic media forensic disclaimer included on all checks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
