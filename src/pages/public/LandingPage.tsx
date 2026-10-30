import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileText,
  Search,
  AlertCircle,
  CheckCircle,
  MapPin,
  TrendingUp,
  Cpu,
  Lock,
  ChevronRight,
  Eye,
  Activity,
  Layers,
  Award,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const LandingPage: React.FC = () => {
  const { user, quickLogin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'policy' | 'scheme' | 'grievance' | 'verify'>('policy');
  const [transparencyStats, setTransparencyStats] = useState({
    totalReports: 1420,
    resolvedReports: 1338,
    resolutionRate: 94,
    avgResolutionDays: 2.1,
  });

  useEffect(() => {
    fetch('/api/dashboard/transparency')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setTransparencyStats(d);
      })
      .catch(() => {});
  }, []);

  const handleQuickDemo = async (role: 'citizen' | 'officer' | 'admin') => {
    await quickLogin(role);
    navigate(role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="relative overflow-hidden app-bg app-text transition-colors duration-200">
      {/* Background ambient lighting glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#477BFF]/15 via-[#8968FF]/10 to-transparent blur-[120px] pointer-events-none opacity-80 dark:opacity-100" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-[#38D9E6]/10 blur-[100px] pointer-events-none opacity-60 dark:opacity-100" />
      <div className="absolute top-2/3 -right-48 w-96 h-96 bg-[#8968FF]/10 blur-[100px] pointer-events-none opacity-60 dark:opacity-100" />

      {/* ========================================================
          HERO SECTION
          ======================================================== */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill announcement */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/[0.05] border border-[var(--border-color)] text-xs font-medium text-[var(--text-main)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#38D9E6] animate-pulse" />
              <span className="text-[#38D9E6] font-mono font-semibold">{t('app.track', 'Civic Pulse & Digital Governance')}</span>
              <span className="text-slate-400">•</span>
              <span className="text-[var(--text-muted)]">{t('hero.badge', 'Powered by Gemini 3.8')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight app-text leading-[1.12]">
              {t('hero.title1', 'Government Information.')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#477BFF] via-[#38D9E6] to-[#8968FF]">
                {t('hero.title2', "Finally Within Everyone's Reach.")}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--text-muted)] font-normal leading-relaxed max-w-2xl">
              {t('hero.desc', 'Understand public policies, verify information, report civic issues, and access essential public services — all through one intelligent platform.')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/register'}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] hover:from-[#3a6ee8] hover:to-[#2e5fd4] shadow-xl shadow-[#477BFF]/25 hover:shadow-[#477BFF]/40 transition-all text-base group"
              >
                <span>{t('hero.ctaExplore', 'Explore Civic Intelligence')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium app-text bg-black/5 dark:bg-white/[0.05] hover:bg-black/10 dark:hover:bg-white/[0.09] border border-[var(--border-color)] transition-all text-base"
              >
                <Eye className="w-4 h-4 text-[#38D9E6]" />
                <span>{t('hero.ctaHow', 'See How It Works')}</span>
              </Link>
            </div>

            {/* Quick Demo Selector */}
            <div className="pt-4 border-t border-[var(--border-color)]">
              <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {t('hero.instantDemo', 'Instant Demo Exploration (Pre-configured Profiles):')}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickDemo('citizen')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.1] border border-[var(--border-color)] app-text transition-all flex items-center gap-2 shadow-sm"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>{t('hero.demoCitizen', 'Citizen (Priya Patel)')}</span>
                </button>
                <button
                  onClick={() => handleQuickDemo('officer')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.1] border border-[var(--border-color)] app-text transition-all flex items-center gap-2 shadow-sm"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>{t('hero.demoOfficer', 'Civic Officer (V. Sharma)')}</span>
                </button>
                <button
                  onClick={() => handleQuickDemo('admin')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.1] border border-[var(--border-color)] app-text transition-all flex items-center gap-2 shadow-sm"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>{t('hero.demoAdmin', 'Administrator (Dr. Sen)')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Animated Live Product Preview */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative ring */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#477BFF]/40 via-[#38D9E6]/30 to-[#8968FF]/40 opacity-75 blur-xl transition duration-1000 group-hover:opacity-100" />

              {/* Main Preview Glass Container */}
              <div className="relative rounded-3xl glass-panel p-6 border border-[var(--border-card)] shadow-2xl space-y-4">
                {/* Header bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-[var(--text-muted)] ml-2">civiclens.gov/live-triage</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                    <Activity className="w-3 h-3 animate-pulse" />
                    LIVE PULSE
                  </span>
                </div>

                {/* Card 1: AI Triage Stream */}
                <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/[0.03] border border-[var(--border-color)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold app-text flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                      Incoming Grievance Triage
                    </span>
                    <StatusBadge status="High" type="severity" size="sm" />
                  </div>
                  <p className="text-xs text-[var(--text-main)] font-medium">
                    Road Crater at Navrangpura Junction
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
                    <span>AI Route: Roads & Infra Dept</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">94% Confidence</span>
                  </div>
                </div>

                {/* Card 2: Policy Intelligence Snapshot */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#477BFF]/10 to-transparent border border-[#477BFF]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold app-text flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#38D9E6]" />
                      PM Surya Ghar Policy Explainer
                    </span>
                    <span className="text-[10px] font-mono text-[#38D9E6] bg-[#38D9E6]/10 px-2 py-0.5 rounded font-bold">
                      Citations Grounded
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    "Central subsidy covers ₹30,000/kW up to 2 kW, giving eligible households up to 300 free units/month."
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-bold">
                      <CheckCircle className="w-3 h-3" /> Gazette Sec 2 Verified
                    </span>
                  </div>
                </div>

                {/* Card 3: Fact Verification Engine */}
                <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/[0.03] border border-[var(--border-color)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold app-text flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Viral Claim Verification
                    </span>
                    <StatusBadge status="Contradicted by evidence" type="verdict" size="sm" />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] italic">
                    "Viral ₹5,000 allowance for all youth via WhatsApp link"
                  </p>
                  <div className="text-[11px] text-rose-500 flex items-center gap-1 font-mono font-medium">
                    <span>PIB Fact Check: Phishing scam targeting Aadhaar credentials.</span>
                  </div>
                </div>

                {/* Interactive status bar */}
                <div className="pt-2 flex items-center justify-between text-xs text-[var(--text-muted)] border-t border-[var(--border-color)]">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#477BFF]" />
                    Interactive Civic Map Active
                  </span>
                  <Link to="/map" className="text-[#38D9E6] hover:underline flex items-center gap-0.5 font-semibold">
                    Open Map <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 1: TRUSTED CIVIC PULSE METRICS
          ======================================================== */}
      <section className="py-12 border-y border-[var(--border-color)] bg-black/5 dark:bg-[#0E1528]/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold app-text font-mono">
                {transparencyStats.totalReports.toLocaleString()}+
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">
                {t('stats.reports', 'Grievances Triaged & Tracked')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#38D9E6] font-mono">
                {transparencyStats.resolutionRate}%
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">
                {t('stats.resolution', 'Verified Resolution Rate')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#8968FF] font-mono">
                {transparencyStats.avgResolutionDays} Days
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">
                {t('stats.time', 'Average Municipal Action Time')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-500 font-mono">
                100%
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">
                {t('stats.grounded', 'Citation Grounded AI Explanations')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2: FOUR CORE PLATFORM CAPABILITIES
          ======================================================== */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#38D9E6] px-3 py-1 rounded-full bg-[#38D9E6]/10 border border-[#38D9E6]/20">
            {t('pillars.badge', 'Intelligent Governance Architecture')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold app-text tracking-tight">
            {t('pillars.title', 'Four Pillars of Democratic Civic Empowerment')}
          </h2>
          <p className="text-base text-[var(--text-muted)]">
            {t('pillars.subtitle', 'Designed to bridge the systemic gap between complex public paperwork, municipal departments, and everyday citizens.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#477BFF]/10 border border-[#477BFF]/20 flex items-center justify-center text-[#477BFF]">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold app-text">{t('pillar.policy.title', 'AI Policy Explainer')}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {t('pillar.policy.desc', 'Upload official gazettes and notifications. Generates simple summaries, eligibility checks, required documents, and citations.')}
              </p>
            </div>
            <Link to="/policies" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#477BFF] hover:underline pt-2">
              <span>Explain a Policy</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2 */}
          <div className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#38D9E6]/10 border border-[#38D9E6]/20 flex items-center justify-center text-[#38D9E6]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold app-text">{t('pillar.scheme.title', 'Government Scheme Explorer')}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {t('pillar.scheme.desc', 'Find central and state welfare programs. Match your profile against criteria to discover eligible subsidies and grants.')}
              </p>
            </div>
            <Link to="/schemes" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#38D9E6] hover:underline pt-2">
              <span>Explore Schemes</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 3 */}
          <div className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold app-text">{t('pillar.grievance.title', 'Civic Grievance Intelligence')}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {t('pillar.grievance.desc', 'Report potholes, water ruptures, broken streetlights, or waste. Gemini multimodal AI categorizes severity and routes to municipal divisions.')}
              </p>
            </div>
            <Link to="/reports/new" className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:underline pt-2">
              <span>Report an Issue</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 4 */}
          <div className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#8968FF]">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold app-text">{t('pillar.fact.title', 'Fact Verification Engine')}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {t('pillar.fact.desc', 'Verify viral messages, WhatsApp forwarded claims, and rumors against official government gazettes, PIB clarifications, and verified public databases.')}
              </p>
            </div>
            <Link to="/fact-check" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8968FF] hover:underline pt-2">
              <span>Verify Claims</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          FINAL CTA BANNER
          ======================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative rounded-3xl app-banner border border-[var(--border-card)] p-10 sm:p-16 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold app-text tracking-tight">
              Ready to Experience Intelligent Civic Governance?
            </h2>
            <p className="text-base text-[var(--text-muted)] leading-relaxed">
              Join thousands of active citizens, municipal engineers, and public policy researchers using CivicLens AI to understand, verify, and act.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-[#477BFF] hover:bg-[#386df0] shadow-xl shadow-[#477BFF]/30 transition-all text-base"
              >
                <span>{t('nav.getStarted', 'Create Free Citizen Account')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/transparency"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-medium app-text bg-black/5 dark:bg-white/[0.05] hover:bg-black/10 dark:hover:bg-white/[0.1] border border-[var(--border-color)] transition-all text-base"
              >
                {t('nav.transparency', 'View Public Transparency Data')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
