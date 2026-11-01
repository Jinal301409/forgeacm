import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-slate-300">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold border border-emerald-500/20">
          <Lock className="w-3.5 h-3.5" /> DPDP ACT COMPLIANT
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Privacy Policy & Citizen Data Rights
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Last Updated: March 2025 • Governed under the Digital Personal Data Protection Act 2023
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl space-y-6 text-sm leading-relaxed border border-white/[0.08]">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Data Fiduciary Principles</h2>
          <p className="text-slate-400">
            CivicLens AI operates strictly as a data fiduciary committed to transparent processing of civic grievance reports, scheme eligibility inquiries, and policy consultation queries. We collect only minimal personal information necessary to deliver public governance services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. What We Collect & Why</h2>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400">
            <li><strong className="text-white">Account Details:</strong> Name, email, telephone number, city, and state for authenticating citizen sessions and sending status notifications.</li>
            <li><strong className="text-white">Civic Grievance Reports:</strong> Descriptions, photographs, and GPS coordinates of reported municipal defects strictly for municipal routing and remediation.</li>
            <li><strong className="text-white">Eligibility Criteria:</strong> Voluntary demographic inputs (income bracket, age, occupation) used solely for client-side and ephemeral scheme matching.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Public Transparency vs Personal Privacy</h2>
          <p className="text-slate-400">
            While CivicLens publishes aggregated civic metrics (e.g. ward response rates, repaired potholes), we strictly anonymize all personally identifiable information (PII). Your name, contact details, and precise residential location are never displayed publicly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Your Rights Under the DPDP Act</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <strong className="text-white block mb-1">Right to Access</strong>
              Summary of all personal data held and processed by CivicLens AI.
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <strong className="text-white block mb-1">Right to Correction</strong>
              Update incorrect personal details at any time in Profile Settings.
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <strong className="text-white block mb-1">Right to Erasure</strong>
              Delete your account and all associated personal records permanently.
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <strong className="text-white block mb-1">Grievance Redressal</strong>
              File an appeal regarding data handling with response within 7 working days.
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">5. Security Infrastructure</h2>
          <p className="text-slate-400">
            All database communications use TLS 1.3 encryption. Passwords are salted and hashed using bcrypt. Access tokens are cryptographically signed with short-lived JWT credentials.
          </p>
        </section>
      </div>
    </div>
  );
};
