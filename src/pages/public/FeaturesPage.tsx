import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  AlertCircle,
  CheckCircle,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
  FileCheck,
  Cpu,
  BarChart2,
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      title: 'Multilingual Policy Explainer',
      description: 'Upload PDF gazette orders or paste official notification links. AI extracts eligibility criteria, required documents, deadlines, and rights in English, Hindi, Gujarati, Marathi, Bengali, and Tamil.',
      icon: FileText,
      color: 'text-[#477BFF]',
      tag: 'Policy Intelligence',
    },
    {
      title: 'Grounded Citation Engine',
      description: 'Every statement explicitly cites section headings and clause numbers from original gazettes, preventing AI hallucinations and distinguishing verbatim provisions from interpretations.',
      icon: FileCheck,
      color: 'text-emerald-400',
      tag: 'Legal Verification',
    },
    {
      title: 'Government Scheme Discovery',
      description: 'Search central and state welfare schemes across healthcare, agriculture, housing, scholarships, and women welfare. Compare your age, income, and category to assess eligibility.',
      icon: Search,
      color: 'text-[#38D9E6]',
      tag: 'Citizen Welfare',
    },
    {
      title: 'Multimodal Grievance Triage',
      description: 'Submit photographs of potholes, water leaks, broken streetlights, or trash. Gemini 3.8 assesses severity, flags duplicates, and routes to appropriate municipal engineering divisions.',
      icon: AlertCircle,
      color: 'text-orange-400',
      tag: 'Civic Triage',
    },
    {
      title: 'Interactive Civic Issue Map',
      description: 'View reported civic infrastructure issues plotted on OpenStreetMap with color-coded severity markers, status filters, and click-to-report geocoding.',
      icon: MapPin,
      color: 'text-[#8968FF]',
      tag: 'Spatial Intelligence',
    },
    {
      title: 'Fact Verification Engine',
      description: 'Analyze viral rumors, WhatsApp messages, and news claims against official government gazettes, PIB clarifications, and verified public databases with confidence scores.',
      icon: CheckCircle,
      color: 'text-pink-400',
      tag: 'Anti-Misinformation',
    },
    {
      title: 'Public Service Application Assistant',
      description: 'Step-by-step guided checklists for essential civic procedures like solar rooftop subsidies, Ayushman cards, voter registration, and domicile verification.',
      icon: Clock,
      color: 'text-amber-400',
      tag: 'Public Service',
    },
    {
      title: 'Immutable Administrative Audit Logs',
      description: 'Comprehensive audit trails tracking every status transition, officer assignment, and remark with timestamped cryptographic integrity.',
      icon: Shield,
      color: 'text-indigo-400',
      tag: 'Governance Audit',
    },
  ];

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#38D9E6] px-3 py-1 rounded-full bg-[#38D9E6]/10 border border-[#38D9E6]/20">
          Platform Architecture
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Comprehensive Civic Intelligence Toolkit
        </h1>
        <p className="text-base text-slate-400 leading-relaxed">
          Explore the modular technologies powering transparent governance, multimodal triage, and citizen empowerment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="glass-card p-6 rounded-2xl space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#111A35] to-[#121B38] border border-white/[0.1] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white">Experience CivicLens AI Today</h3>
          <p className="text-sm text-slate-400">Create your citizen account or log in as an administrator for instant review.</p>
        </div>
        <Link
          to="/register"
          className="px-6 py-3 rounded-xl font-semibold text-white bg-[#477BFF] hover:bg-[#386df0] transition-all flex items-center gap-2 shadow-lg shadow-[#477BFF]/25"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
