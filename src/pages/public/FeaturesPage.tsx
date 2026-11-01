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
    <div className="relative overflow-hidden app-bg app-text" style={{ paddingTop: 'clamp(96px,12vh,128px)' }}>
      <div className="orb-cyan" style={{ opacity: 0.5 }} />
      <div className="orb-blue" style={{ opacity: 0.4 }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-16 relative z-10">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="section-tag">
          <span style={{ width: '6px', height: '6px', borderRadius: '9999px', background: '#38D9E6', flexShrink: 0 }} />
          Platform Architecture
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold app-text tracking-tight" style={{ letterSpacing: '-0.03em' }}>
          Comprehensive Civic Intelligence Toolkit
        </h1>
        <p className="text-base app-text-muted leading-relaxed">
          Explore the modular technologies powering transparent governance, multimodal triage, and citizen empowerment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="glass-card tint-card p-6 rounded-2xl space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.color}`} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="section-tag" style={{ padding: '2px 8px', fontSize: '9px' }}>
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold app-text">{f.title}</h3>
                <p className="text-xs app-text-muted leading-relaxed">{f.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold app-text">Experience CivicLens AI Today</h3>
          <p className="text-sm app-text-muted">Create your citizen account or log in as an administrator for instant review.</p>
        </div>
        <Link
          to="/register"
          className="btn-brand flex items-center gap-2"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      </div>
    </div>
  );
};
