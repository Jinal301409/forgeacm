import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, Award, Users, FileCheck, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-300 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#38D9E6] px-3 py-1 rounded-full bg-[#38D9E6]/10 border border-[#38D9E6]/20">
          Our Civic Mission
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Democratizing Public Policy & Civic Accountability
        </h1>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
          CivicLens AI was founded on a simple conviction: government policies, public benefits, and civic infrastructure should be transparent, verifiable, and accessible to every citizen.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#477BFF]/10 text-[#477BFF] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Understand</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Legal gazettes and policy notifications are notoriously dense. We translate convoluted circulars into clear citizen checklists, deadlines, and multilingual explanations.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#38D9E6]/10 text-[#38D9E6] flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Verify</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Misinformation erodes civic trust. Our fact verification engine correlates viral messages directly with official government gazettes and PIB releases, distinguishing factual reality from malicious hoaxes.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#8968FF]/10 text-[#8968FF] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Act</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Citizen grievances should not disappear into black holes. We provide geocoded reporting, automated severity triage, officer dispatch tracking, and public SLA audit metrics.
          </p>
        </div>
      </div>

      {/* Institutional Integrity Standards */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#38D9E6]" />
          Our Declaration of Institutional Integrity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div className="space-y-2">
            <h4 className="font-semibold text-white">1. Non-Partisan Objectivity</h4>
            <p className="text-slate-400">
              CivicLens AI does not endorse political parties, candidates, or editorial opinions. We evaluate exclusively official policy text, budget line items, and verifiable public facts.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-white">2. Grounded Citations</h4>
            <p className="text-slate-400">
              Every AI analysis clearly specifies the official document section, clause number, and issuing ministry so citizens can cross-verify the source material directly.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-white">3. Public Transparency Without Surveillance</h4>
            <p className="text-slate-400">
              We uphold citizen anonymity on public boards. Grievances display aggregate ward locations without exposing personal phone numbers or precise residential markers.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-white">4. Clear Jurisdictional Boundaries</h4>
            <p className="text-slate-400">
              We clearly distinguish between platforms tracking internal civic escalations versus formal submission to state agencies, ensuring citizen expectations remain honest and grounded.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-4">
          <span className="text-xs text-slate-400 font-mono">
            Compliant with Digital Personal Data Protection Act (DPDP) 2023
          </span>
          <Link
            to="/transparency"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#477BFF] hover:underline"
          >
            Explore Live Public Transparency <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
