/**
 * CivicLens AI — Footer
 * Proofline-style: deep dark panel, grid layout, status badge, minimal bottom bar
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Database, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const linkStyle: React.CSSProperties = {
    fontSize: '13.5px',
    color: isDark ? '#8E8E8E' : '#64748B',
    textDecoration: 'none',
    transition: 'color 0.18s',
    display: 'block',
    padding: '2px 0',
  };

  const colHeadStyle: React.CSSProperties = {
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: isDark ? '#F8FAFC' : '#0B132B',
    marginBottom: '16px',
  };

  return (
    <footer
      style={{
        background: isDark ? '#04060A' : '#F4F6FB',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)'}`,
        color: isDark ? '#8E8E8E' : '#64748B',
        transition: 'background 0.25s, color 0.25s',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'clamp(56px, 7vh, 88px) clamp(16px, 3vw, 32px) clamp(32px, 4vh, 48px)',
        }}
      >
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            <Link
              to="/"
              className="flex items-center gap-3 group"
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #477BFF 0%, #38D9E6 100%)',
                  padding: '1.5px',
                  flexShrink: 0,
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.10)',
                  transition: 'transform 0.28s var(--ease-out-quart)',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isDark ? '#04060A' : '#fff',
                  }}
                >
                  <ShieldCheck style={{ width: '18px', height: '18px', color: '#38D9E6' }} />
                </div>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '15px',
                  letterSpacing: '-0.01em',
                  color: isDark ? '#F8FAFC' : '#0B132B',
                }}
              >
                CIVICLENS{' '}
                <span style={{ color: '#38D9E6' }}>AI</span>
              </span>
            </Link>

            <p
              style={{
                fontSize: '13.5px',
                lineHeight: 1.7,
                color: isDark ? '#8E8E8E' : '#64748B',
                maxWidth: '320px',
              }}
            >
              {t('footer.desc', 'An intelligent civic infrastructure platform bridging citizens, verified government policies, public scheme discovery, and municipal grievance accountability.')}
            </p>

            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="flex items-center gap-1.5"
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: '#10B981',
                  background: 'rgba(16,185,129,0.10)',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(16,185,129,0.22)',
                }}
              >
                <span
                  className="animate-pulse"
                  style={{ width: '6px', height: '6px', borderRadius: '9999px', background: '#10B981', flexShrink: 0 }}
                />
                All Systems Operational
              </span>
              <span
                className="flex items-center gap-1.5"
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: '#38D9E6',
                  background: 'rgba(56,217,230,0.10)',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(56,217,230,0.22)',
                }}
              >
                <Cpu style={{ width: '11px', height: '11px' }} />
                Gemini 3.8 Flash
              </span>
            </div>
          </div>

          {/* Link columns */}
          <div>
            <h4 style={colHeadStyle}>Civic Intelligence</h4>
            <ul className="space-y-3">
              {[
                { to: '/policies', label: t('menu.policyExplainer', 'AI Policy Explainer') },
                { to: '/schemes', label: t('nav.schemes', 'Government Schemes') },
                { to: '/reports/new', label: t('menu.reportIssue', 'File Civic Grievance') },
                { to: '/fact-check', label: t('menu.factVerification', 'Fact Verification Engine') },
                { to: '/map', label: t('menu.civicMap', 'Live Civic Issue Map') },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} style={linkStyle}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={colHeadStyle}>Transparency</h4>
            <ul className="space-y-3">
              {[
                { to: '/transparency', label: t('nav.transparency', 'Public Civic Pulse') },
                { to: '/how-it-works', label: t('nav.howItWorks', 'AI Grounding Methodology') },
                { to: '/about', label: t('nav.about', 'Institutional Integrity') },
                { to: '/features', label: t('nav.features', 'Platform Architecture') },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} style={linkStyle}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={colHeadStyle}>Legal &amp; Compliance</h4>
            <ul className="space-y-3">
              {[
                { to: '/privacy', label: 'DPDP Act Privacy Policy' },
                { to: '/terms', label: 'Terms & Citizen Code' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} style={linkStyle}>
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <p
                  style={{
                    fontSize: '11.5px',
                    lineHeight: 1.6,
                    color: isDark ? '#5A5A5A' : '#94A3B8',
                    marginTop: '6px',
                  }}
                >
                  AI analyses are informative and grounded in source gazettes, without replacing formal judicial counsel.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            marginTop: 'clamp(40px, 5vh, 56px)',
            paddingTop: 'clamp(20px, 3vh, 28px)',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)'}`,
            fontSize: '11.5px',
            color: isDark ? 'rgba(255,255,255,0.28)' : '#94A3B8',
          }}
        >
          <p>
            © {new Date().getFullYear()} CivicLens AI Platform. Built for Digital Governance &amp; Public Information.
          </p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Database style={{ width: '13px', height: '13px', color: '#477BFF' }} />
              Secure Data Storage
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 style={{ width: '13px', height: '13px', color: '#10B981' }} />
              Role-Based Access
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
