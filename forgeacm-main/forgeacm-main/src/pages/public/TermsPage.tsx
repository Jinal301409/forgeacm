import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-slate-300">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono font-semibold border border-blue-500/20">
          <FileText className="w-3.5 h-3.5" /> CITIZEN CODE OF CONDUCT
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Terms & Conditions
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Last Updated: March 2025 • CivicLens AI Digital Governance Platform
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl space-y-6 text-sm leading-relaxed border border-white/[0.08]">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Nature of Platform & AI Advisory</h2>
          <p className="text-slate-400">
            CivicLens AI provides civic intelligence, scheme discovery assistance, grievance routing support, and public policy translation. All AI-generated explanations are informational and do not substitute for official statutory gazette notifications or formal legal counsel.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Responsible Civic Reporting</h2>
          <p className="text-slate-400">
            Citizens agree to submit genuine, truthful photographs and descriptions of civic infrastructure issues. Submitting intentionally fraudulent complaints, abusive media, or commercial advertisements is strictly prohibited and results in immediate account revocation and blacklisting.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Third-Party Portals & Application Submissions</h2>
          <p className="text-slate-400">
            CivicLens AI provides step-by-step guidance and hyperlinks to official government portals (e.g. pmsuryaghar.gov.in, beneficiary.nha.gov.in). We do not collect application fees or claim to act as an unauthorized middleman.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Fact Verification Disclaimer</h2>
          <p className="text-slate-400">
            Our Fact Verification Engine evaluates claims against verified government announcements and PIB clarifications. Forensic synthetic-media detection is informational; we do not certify forensic digital watermarks.
          </p>
        </section>
      </div>
    </div>
  );
};
