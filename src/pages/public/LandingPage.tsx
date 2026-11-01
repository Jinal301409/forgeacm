/**
 * CivicLens AI — Landing Page
 * Redesigned to match Proofline visual language:
 * - Pure black canvas, gradient orbs, Inter display type
 * - Floating pill navbar offset (top padding accounts for nav)
 * - Staggered headline animation, scroll-reveal sections
 * - Colour-tint hover cards, stats bar, CTA banner
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Activity,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useTheme } from '../../context/ThemeContext';

/* ── Intersection-observer hook for scroll reveal ── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── Section wrapper with scroll reveal ── */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = '',
}) => {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        '--d': `${delay}s`,
      } as React.CSSProperties}
    >
      {visible ? (
        <div className="anim" style={{ '--d': `${delay}s` } as React.CSSProperties}>
          {children}
        </div>
      ) : (
        <div style={{ opacity: 0 }}>{children}</div>
      )}
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const { user, quickLogin } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [transparencyStats, setTransparencyStats] = useState({
    totalReports: 1420,
    resolvedReports: 1338,
    resolutionRate: 94,
    avgResolutionDays: 2.1,
  });

  useEffect(() => {
    fetch('/api/dashboard/transparency')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setTransparencyStats(d); })
      .catch(() => {});
  }, []);

  const handleQuickDemo = async (role: 'citizen' | 'officer' | 'admin') => {
    await quickLogin(role);
    navigate(role === 'admin' ? '/admin' : '/dashboard');
  };

  const isDark = theme === 'dark';

  /* ── Pillar cards data ── */
  const pillars = [
    {
      icon: FileText,
      title: t('pillar.policy.title', 'AI Policy Explainer'),
      desc: t('pillar.policy.desc', 'Upload official gazettes and notifications. Generates simple summaries, eligibility checks, required documents, and citations.'),
      accent: '#477BFF',
      link: '/policies',
      linkLabel: t('pillar.policy.link', 'Explain a Policy'),
    },
    {
      icon: Search,
      title: t('pillar.scheme.title', 'Government Scheme Explorer'),
      desc: t('pillar.scheme.desc', 'Find central and state welfare programs. Match your profile against criteria to discover eligible subsidies and grants.'),
      accent: '#38D9E6',
      link: '/schemes',
      linkLabel: t('pillar.scheme.link', 'Explore Schemes'),
    },
    {
      icon: AlertCircle,
      title: t('pillar.grievance.title', 'Civic Grievance Intelligence'),
      desc: t('pillar.grievance.desc', 'Report potholes, water ruptures, broken streetlights, or waste. Gemini multimodal AI categorizes severity and routes to municipal divisions.'),
      accent: '#F59E0B',
      link: '/reports/new',
      linkLabel: t('pillar.grievance.link', 'Report an Issue'),
    },
    {
      icon: CheckCircle,
      title: t('pillar.fact.title', 'Fact Verification Engine'),
      desc: t('pillar.fact.desc', 'Verify viral messages, WhatsApp forwarded claims, and rumors against official government gazettes, PIB clarifications, and verified public databases.'),
      accent: '#8968FF',
      link: '/fact-check',
      linkLabel: t('pillar.fact.link', 'Verify Claims'),
    },
  ];

  /* ── Stats ── */
  const stats = [
    {
      value: `${transparencyStats.totalReports.toLocaleString()}+`,
      label: t('stats.reports', 'Grievances Triaged & Tracked'),
      accent: '#F8FAFC',
    },
    {
      value: `${transparencyStats.resolutionRate}%`,
      label: t('stats.resolution', 'Verified Resolution Rate'),
      accent: '#38D9E6',
    },
    {
      value: `${transparencyStats.avgResolutionDays}d`,
      label: t('stats.time', 'Average Municipal Action Time'),
      accent: '#8968FF',
    },
    {
      value: '100%',
      label: t('stats.grounded', 'Citation Grounded AI Explanations'),
      accent: '#10B981',
    },
  ];

  return (
    <div
      className="relative overflow-x-hidden"
      style={{ background: isDark ? '#000000' : '#F4F6FB', color: isDark ? '#F8FAFC' : '#0B132B' }}
    >
      {/* ── Background Orbs ── */}
      <div className="orb-cyan" style={{ opacity: isDark ? 1 : 0.4 }} />
      <div className="orb-blue" style={{ opacity: isDark ? 1 : 0.3 }} />
      <div className="orb-violet" style={{ opacity: isDark ? 1 : 0.3 }} />

      {/* ══════════════════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col items-start justify-center"
        style={{
          minHeight: '100dvh',
          padding: 'clamp(100px,14vh,130px) clamp(16px,6vw,80px) clamp(40px,6vh,80px)',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          {/* ── Left: headline + CTAs ── */}
          <div className="lg:col-span-7 space-y-7 relative z-10">
            {/* Badge pill */}
            <div
              className="anim inline-flex items-center gap-2"
              style={{
                '--d': '0.05s',
                padding: '6px 16px',
                borderRadius: '9999px',
                background: isDark ? '#1A1A1E' : 'rgba(71,123,255,0.06)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(71,123,255,0.20)'}`,
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 500,
                color: isDark ? '#C4C2C3' : '#475569',
              } as React.CSSProperties}
            >
              <span
                className="animate-pulse"
                style={{ width: '7px', height: '7px', borderRadius: '9999px', background: '#38D9E6', flexShrink: 0 }}
              />
              <span style={{ color: '#38D9E6', fontWeight: 600 }}>{t('app.track', 'Civic Pulse')}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{t('hero.badge', 'Powered by Gemini')}</span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(36px, 5.8vw, 74px)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              <span className="headline-line headline-line-1" style={{ color: isDark ? '#fff' : '#0B132B' }}>
                {t('hero.title1', 'Government Information.')}
              </span>
              <span
                className="headline-line headline-line-2"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #477BFF 0%, #38D9E6 50%, #8968FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('hero.title2', "Finally Within Everyone's Reach.")}
              </span>
            </h1>

            {/* Sub-copy */}
            <p
              className="anim"
              style={{
                '--d': '0.38s',
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(15px, 1.6vw, 18px)',
                fontWeight: 400,
                lineHeight: 1.6,
                color: isDark ? '#D0D0D0' : '#475569',
                maxWidth: '540px',
                opacity: isDark ? 0.88 : 1,
              } as React.CSSProperties}
            >
              {t('hero.desc', 'Understand public policies, verify information, report civic issues, and access essential public services — all through one intelligent platform.')}
            </p>

            {/* Primary CTAs */}
            <div
              className="anim flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              style={{ '--d': '0.50s' } as React.CSSProperties}
            >
              <Link
                to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/register'}
                className="btn-brand flex items-center justify-center gap-2 group"
              >
                <span>{t('hero.ctaExplore', 'Explore Civic Intelligence')}</span>
                <ArrowRight
                  style={{ width: '16px', height: '16px', transition: 'transform 0.2s' }}
                  className="group-hover:translate-x-1"
                />
              </Link>
              <Link
                to="/how-it-works"
                className="btn-ghost flex items-center justify-center gap-2"
              >
                <Eye style={{ width: '15px', height: '15px', color: '#38D9E6' }} />
                <span>{t('hero.ctaHow', 'See How It Works')}</span>
              </Link>
            </div>

            {/* Quick Demo selector */}
            <div
              className="anim"
              style={{
                '--d': '0.62s',
                paddingTop: '20px',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.10)'}`,
              } as React.CSSProperties}
            >
              <p
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.10em',
                  color: isDark ? '#8E8E8E' : '#64748B',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles style={{ width: '12px', height: '12px', color: '#F59E0B' }} />
                {t('hero.instantDemo', 'Instant Demo — Pre-configured Profiles:')}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { role: 'citizen' as const, label: t('hero.demoCitizen', 'Citizen (Priya Patel)'), color: '#10B981' },
                  { role: 'officer' as const, label: t('hero.demoOfficer', 'Civic Officer (V. Sharma)'), color: '#477BFF' },
                  { role: 'admin' as const, label: t('hero.demoAdmin', 'Administrator (Dr. Sen)'), color: '#8968FF' },
                ].map(({ role, label, color }) => (
                  <button
                    key={role}
                    onClick={() => handleQuickDemo(role)}
                    className="flex items-center gap-2"
                    style={{
                      padding: '7px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isDark ? '#F8FAFC' : '#0B132B',
                      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.10)'}`,
                      cursor: 'pointer',
                      transition: 'background 0.18s, border-color 0.18s',
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '9999px', background: color, flexShrink: 0 }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Live Preview Card ── */}
          <div className="lg:col-span-5 relative z-10">
            <div
              className="anim"
              style={{ '--d': '0.25s', position: 'relative', maxWidth: '440px', marginLeft: 'auto' } as React.CSSProperties}
            >
              {/* Outer glow ring */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-1px',
                  borderRadius: '28px',
                  background: 'linear-gradient(135deg, rgba(71,123,255,0.35), rgba(56,217,230,0.25), rgba(137,104,255,0.35))',
                  opacity: 0.7,
                  filter: 'blur(16px)',
                  pointerEvents: 'none',
                }}
              />

              {/* Glass container */}
              <div
                className="glass-panel"
                style={{
                  borderRadius: '24px',
                  padding: '20px',
                  position: 'relative',
                }}
              >
                {/* Mock browser bar */}
                <div
                  className="flex items-center justify-between"
                  style={{
                    paddingBottom: '14px',
                    marginBottom: '14px',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ width: '10px', height: '10px', borderRadius: '9999px', background: '#EF4444', opacity: 0.7 }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '9999px', background: '#F59E0B', opacity: 0.7 }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '9999px', background: '#10B981', opacity: 0.7 }} />
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: isDark ? '#8E8E8E' : '#94A3B8',
                        marginLeft: '6px',
                      }}
                    >
                      civiclens.gov/live-triage
                    </span>
                  </div>
                  <span
                    className="flex items-center gap-1"
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: '#10B981',
                      background: 'rgba(16,185,129,0.10)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      border: '1px solid rgba(16,185,129,0.20)',
                    }}
                  >
                    <Activity style={{ width: '10px', height: '10px' }} className="animate-pulse" />
                    LIVE
                  </span>
                </div>

                {/* Card 1: Grievance Triage */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
                    marginBottom: '10px',
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                    <span
                      className="flex items-center gap-1.5"
                      style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#F8FAFC' : '#0B132B' }}
                    >
                      <AlertCircle style={{ width: '13px', height: '13px', color: '#F59E0B' }} />
                      Incoming Grievance Triage
                    </span>
                    <StatusBadge status="High" type="severity" size="sm" />
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#F8FAFC' : '#0B132B', marginBottom: '6px' }}>
                    Road Crater at Navrangpura Junction
                  </p>
                  <div
                    className="flex items-center justify-between"
                    style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: isDark ? '#8E8E8E' : '#64748B' }}
                  >
                    <span>AI Route: Roads &amp; Infra Dept</span>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>94% Confidence</span>
                  </div>
                </div>

                {/* Card 2: Policy Intelligence */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(71,123,255,0.10) 0%, transparent 100%)',
                    border: '1px solid rgba(71,123,255,0.20)',
                    marginBottom: '10px',
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                    <span
                      className="flex items-center gap-1.5"
                      style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#F8FAFC' : '#0B132B' }}
                    >
                      <FileText style={{ width: '13px', height: '13px', color: '#38D9E6' }} />
                      PM Surya Ghar Policy Explainer
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: '#38D9E6',
                        background: 'rgba(56,217,230,0.10)',
                        padding: '2px 7px',
                        borderRadius: '5px',
                      }}
                    >
                      Citations Grounded
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: isDark ? '#94A3B8' : '#64748B', lineHeight: 1.5, marginBottom: '8px' }}>
                    "Central subsidy covers ₹30,000/kW up to 2 kW, giving eligible households up to 300 free units/month."
                  </p>
                  <span
                    className="flex items-center gap-1"
                    style={{ fontSize: '10px', color: '#10B981', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                  >
                    <CheckCircle style={{ width: '11px', height: '11px' }} /> Gazette Sec 2 Verified
                  </span>
                </div>

                {/* Card 3: Fact Check */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
                    marginBottom: '12px',
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                    <span
                      className="flex items-center gap-1.5"
                      style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#F8FAFC' : '#0B132B' }}
                    >
                      <ShieldCheck style={{ width: '13px', height: '13px', color: '#10B981' }} />
                      Viral Claim Verification
                    </span>
                    <StatusBadge status="Contradicted by evidence" type="verdict" size="sm" />
                  </div>
                  <p style={{ fontSize: '11px', color: isDark ? '#94A3B8' : '#64748B', fontStyle: 'italic', marginBottom: '6px' }}>
                    "Viral ₹5,000 allowance for all youth via WhatsApp link"
                  </p>
                  <div
                    style={{ fontSize: '10px', color: '#EF4444', fontFamily: 'var(--font-mono)', fontWeight: 500 }}
                  >
                    PIB Fact Check: Phishing scam targeting Aadhaar credentials.
                  </div>
                </div>

                {/* Footer bar */}
                <div
                  className="flex items-center justify-between"
                  style={{
                    paddingTop: '12px',
                    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
                    fontSize: '11px',
                    color: isDark ? '#8E8E8E' : '#94A3B8',
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin style={{ width: '12px', height: '12px', color: '#477BFF' }} />
                    Interactive Civic Map Active
                  </span>
                  <Link
                    to="/map"
                    className="flex items-center gap-0.5"
                    style={{ color: '#38D9E6', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Open Map <ChevronRight style={{ width: '13px', height: '13px' }} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS BAR
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)'}`,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)'}`,
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)',
          padding: 'clamp(28px,4vh,40px) clamp(16px,3vw,32px)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(({ value, label, accent }, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div
                  className="flex flex-col items-center gap-1.5 group"
                  style={{
                    padding: '10px 8px',
                    borderRadius: '14px',
                    transition: 'transform 0.28s var(--ease-out-quart), background 0.18s',
                    cursor: 'default',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'clamp(20px, 2.6vw, 32px)',
                      fontWeight: 700,
                      letterSpacing: '-0.025em',
                      fontVariantNumeric: 'tabular-nums',
                      color: accent,
                      lineHeight: 1.1,
                    }}
                  >
                    {value}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'clamp(11px, 1.2vw, 12.5px)',
                      color: isDark ? '#8E8E8E' : '#64748B',
                      lineHeight: 1.35,
                    }}
                  >
                    {label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOUR PILLARS SECTION
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: 'clamp(72px,9vh,120px) clamp(16px,3vw,32px)',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        {/* Section header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto" style={{ marginBottom: 'clamp(48px,6vh,72px)' }}>
          <Reveal>
            <span className="section-tag">
              <span style={{ width: '6px', height: '6px', borderRadius: '9999px', background: '#38D9E6', flexShrink: 0 }} />
              {t('pillars.badge', 'Intelligent Governance Architecture')}
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(26px, 4.4vw, 48px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                color: isDark ? '#fff' : '#0B132B',
                margin: '12px 0 0',
              }}
            >
              {t('pillars.title', 'Four Pillars of Democratic Civic Empowerment')}
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(15px, 1.4vw, 17px)',
                lineHeight: 1.65,
                color: isDark ? '#94A3B8' : '#64748B',
              }}
            >
              {t('pillars.subtitle', 'Designed to bridge the systemic gap between complex public paperwork, municipal departments, and everyday citizens.')}
            </p>
          </Reveal>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map(({ icon: Icon, title, desc, accent, link, linkLabel }, i) => (
            <Reveal key={i} delay={i * 0.10}>
              <div
                className="tint-card glass-panel flex flex-col justify-between"
                style={{
                  borderRadius: '20px',
                  padding: '24px',
                  '--card-accent': accent,
                  minHeight: '220px',
                } as React.CSSProperties}
              >
                <div>
                  {/* Icon well */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${accent}18`,
                      border: `1px solid ${accent}30`,
                      marginBottom: '16px',
                    }}
                  >
                    <Icon style={{ width: '22px', height: '22px', color: accent }} />
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: isDark ? '#F8FAFC' : '#0B132B',
                      marginBottom: '10px',
                      lineHeight: 1.3,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      lineHeight: 1.65,
                      color: isDark ? '#94A3B8' : '#64748B',
                    }}
                  >
                    {desc}
                  </p>
                </div>
                <Link
                  to={link}
                  className="flex items-center gap-1.5 mt-5"
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: accent,
                    textDecoration: 'none',
                    transition: 'gap 0.18s',
                  }}
                >
                  {linkLabel} <ArrowRight style={{ width: '13px', height: '13px' }} />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FINAL CTA BANNER
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: 'clamp(48px,6vh,80px) clamp(16px,3vw,32px) clamp(72px,8vh,100px)',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        <Reveal>
          <div
            className="relative overflow-hidden text-center"
            style={{
              borderRadius: '28px',
              padding: 'clamp(48px,6vh,80px) clamp(24px,4vw,64px)',
              background: isDark
                ? 'linear-gradient(135deg, rgba(14,21,40,0.90) 0%, rgba(8,11,18,0.95) 100%)'
                : 'linear-gradient(135deg, #EEF2FF 0%, #F0F9FF 50%, #FAF5FF 100%)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(71,123,255,0.18)'}`,
              boxShadow: isDark
                ? '0 20px 60px -12px rgba(0,0,0,0.70)'
                : '0 12px 40px -8px rgba(71,123,255,0.12)',
            }}
          >
            {/* Orbs inside banner */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse 600px 300px at 50% 100%, rgba(71,123,255,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(ellipse at center, rgba(137,104,255,0.10) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div className="relative z-10 max-w-2xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(24px, 3.8vw, 44px)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  color: isDark ? '#fff' : '#0B132B',
                  margin: 0,
                }}
              >
                {t('cta.title', 'Ready to Experience Intelligent Civic Governance?')}
              </h2>
              <p
                style={{
                  fontSize: 'clamp(14px, 1.4vw, 17px)',
                  lineHeight: 1.65,
                  color: isDark ? '#94A3B8' : '#64748B',
                  maxWidth: '520px',
                }}
              >
                {t('cta.desc', 'Join thousands of active citizens, municipal engineers, and public policy researchers using CivicLens AI to understand, verify, and act.')}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  to="/register"
                  className="btn-brand flex items-center gap-2"
                >
                  {t('nav.getStarted', 'Create Free Citizen Account')}
                  <ArrowRight style={{ width: '15px', height: '15px' }} />
                </Link>
                <Link
                  to="/transparency"
                  className="btn-ghost flex items-center gap-2"
                >
                  {t('nav.transparency', 'View Public Transparency Data')}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
