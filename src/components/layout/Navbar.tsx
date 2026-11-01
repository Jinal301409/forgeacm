/**
 * CivicLens AI — Navbar
 * Proofline-style: floating pill, fixed at top, slide-down entrance
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  ArrowRight,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, languages, t } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: t('nav.features', 'Features'), path: '/features' },
    { name: t('nav.howItWorks', 'How It Works'), path: '/how-it-works' },
    { name: t('nav.transparency', 'Transparency'), path: '/transparency' },
    { name: t('nav.schemes', 'Schemes'), path: '/schemes' },
    { name: t('nav.policies', 'Policies'), path: '/policies' },
    { name: t('nav.about', 'About'), path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  // Close lang menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Fixed top bar — invisible track, just positions the pill */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        style={{ top: 'clamp(10px, 2vh, 18px)', padding: '0 clamp(12px, 2vw, 24px)' }}
        aria-label="Main navigation"
      >
        {/* Pill container */}
        <nav
          className="nav-pill flex items-center gap-1"
          style={{
            height: 'clamp(48px, 5.5vw, 56px)',
            padding: '4px 8px',
            maxWidth: '1100px',
            width: '100%',
          }}
          role="navigation"
        >
          {/* ── Logo ── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 group mr-2"
            aria-label={t('app.name', 'CivicLens AI home')}
          >
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{
                width: 'clamp(34px, 4vw, 40px)',
                height: 'clamp(34px, 4vw, 40px)',
                background: 'linear-gradient(135deg, #477BFF 0%, #38D9E6 100%)',
                padding: '1.5px',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.12), 0 4px 14px rgba(71,123,255,0.35)',
                transition: 'transform 0.28s var(--ease-out-quart), box-shadow 0.28s var(--ease-out-quart)',
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{ background: theme === 'dark' ? '#04060A' : '#fff' }}
              >
                <ShieldCheck
                  className="transition-transform group-hover:scale-110"
                  style={{ width: '55%', height: '55%', color: '#38D9E6' }}
                />
              </div>
            </div>
            <span
              className="hidden sm:block font-bold tracking-tight"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(13px, 1.4vw, 15px)',
                color: theme === 'dark' ? '#E2E8F0' : '#1E293B',
                letterSpacing: '-0.01em',
              }}
            >
              CIVICLENS{' '}
              <span style={{ color: '#38D9E6' }}>AI</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative flex items-center justify-center"
                  style={{
                    height: 'calc(100% - 4px)',
                    padding: '0 11px',
                    borderRadius: '9999px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'clamp(12px, 1.3vw, 13.5px)',
                    fontWeight: active ? 600 : 500,
                    color: theme === 'dark'
                      ? (active ? '#F8FAFC' : 'rgba(255,255,255,0.55)')
                      : (active ? '#0B132B' : 'rgba(11,19,43,0.55)'),
                    background: active
                      ? (theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(71,123,255,0.08)')
                      : 'transparent',
                    transition: 'color 0.18s, background 0.18s, opacity 0.18s',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.name}
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '14px',
                        height: '2px',
                        borderRadius: '9999px',
                        background: '#38D9E6',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Spacer (tablet: pushes controls to right) ── */}
          <div className="flex-1 lg:hidden" />

          {/* ── Right Controls ── */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language selector */}
            <div className="relative" ref={langRef}>
              <button
                id="lang-toggle"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5"
                style={{
                  height: '34px',
                  padding: '0 12px',
                  borderRadius: '9999px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: theme === 'dark' ? '#C8C8C8' : '#475569',
                  background: theme === 'dark' ? '#28282A' : 'rgba(15,23,42,0.06)',
                  border: '1px solid ' + (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.10)'),
                  cursor: 'pointer',
                  transition: 'background 0.18s, color 0.18s',
                }}
                aria-label={t('lang.select', 'Select Language')}
                aria-expanded={langMenuOpen}
                aria-haspopup="listbox"
              >
                <Globe style={{ width: '13px', height: '13px', color: '#38D9E6' }} />
                <span>{language}</span>
              </button>

              {langMenuOpen && (
                <div
                  className="absolute right-0 z-50"
                  style={{
                    top: 'calc(100% + 8px)',
                    width: '200px',
                    background: theme === 'dark' ? '#141416' : '#FFFFFF',
                    border: '1px solid ' + (theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.10)'),
                    borderRadius: '16px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.50)',
                    animation: '0.22s var(--ease-out-quart) menuIn forwards',
                    overflow: 'hidden',
                  }}
                  role="listbox"
                  aria-label={t('lang.select', 'Select Language')}
                >
                  <div
                    style={{
                      padding: '8px 14px 6px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    {t('lang.select', 'Select Language')}
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      role="option"
                      aria-selected={language === l.name}
                      onClick={() => {
                        setLanguage(l.name as SupportedLanguage);
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center justify-between"
                      style={{
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontFamily: 'var(--font-sans)',
                        color: language === l.name ? '#38D9E6' : 'var(--text-main)',
                        background: language === l.name
                          ? 'rgba(56,217,230,0.08)'
                          : 'transparent',
                        fontWeight: language === l.name ? 600 : 400,
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'background 0.15s',
                      }}
                    >
                      <span>{l.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {l.nativeName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme === 'dark' ? '#28282A' : 'rgba(15,23,42,0.06)',
                border: '1px solid ' + (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.10)'),
                cursor: 'pointer',
                transition: 'background 0.18s, transform 0.22s var(--ease-out-quart)',
              }}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark'
                ? <Sun style={{ width: '14px', height: '14px', color: '#F59E0B' }} />
                : <Moon style={{ width: '14px', height: '14px', color: '#477BFF' }} />}
            </button>

            {/* Auth CTAs */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2"
                  style={{
                    height: '34px',
                    padding: '0 16px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#fff',
                    background: 'linear-gradient(135deg, #477BFF 0%, #38D9E6 100%)',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(71,123,255,0.35)',
                    transition: 'transform 0.22s var(--ease-out-quart), box-shadow 0.22s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <LayoutDashboard style={{ width: '13px', height: '13px' }} />
                  <span>{t('nav.dashboard', 'Dashboard')}</span>
                  <span
                    style={{
                      fontSize: '9px',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: 'rgba(0,0,0,0.25)',
                    }}
                  >
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: theme === 'dark' ? '#28282A' : 'rgba(15,23,42,0.06)',
                    border: '1px solid ' + (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.10)'),
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    transition: 'color 0.18s, background 0.18s',
                  }}
                  title={t('nav.signOut', 'Sign Out')}
                  aria-label={t('nav.signOut', 'Sign Out')}
                >
                  <LogOut style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  style={{
                    height: '34px',
                    padding: '0 14px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: theme === 'dark' ? '#C8C8C8' : '#475569',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.18s',
                  }}
                >
                  {t('nav.signIn', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5"
                  style={{
                    height: '34px',
                    padding: '0 18px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#000',
                    background: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.18), 0 0 18px rgba(255,255,255,0.24)',
                    transition: 'transform 0.22s var(--ease-out-quart), box-shadow 0.22s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t('nav.getStarted', 'Get Started')}
                  <ArrowRight style={{ width: '13px', height: '13px' }} />
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile controls ── */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme === 'dark' ? '#28282A' : 'rgba(15,23,42,0.06)',
                border: '1px solid ' + (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.10)'),
                cursor: 'pointer',
              }}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark'
                ? <Sun style={{ width: '14px', height: '14px', color: '#F59E0B' }} />
                : <Moon style={{ width: '14px', height: '14px', color: '#477BFF' }} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme === 'dark' ? '#28282A' : 'rgba(15,23,42,0.06)',
                border: '1px solid ' + (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.10)'),
                cursor: 'pointer',
                color: 'var(--text-main)',
              }}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen
                ? <X style={{ width: '16px', height: '16px' }} />
                : <Menu style={{ width: '16px', height: '16px' }} />}
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile Overlay ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 md:hidden z-40"
          style={{
            background: 'rgba(0,0,0,0.70)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            animation: '0.22s overlayIn forwards',
          }}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Menu Card ── */}
      {mobileMenuOpen && (
        <div
          className="fixed md:hidden z-50"
          style={{
            top: 'clamp(70px,10vh,90px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(92%, 360px)',
            background: theme === 'dark' ? '#141416' : '#FFFFFF',
            border: '1px solid ' + (theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.10)'),
            borderRadius: '24px',
            padding: '12px',
            boxShadow: '0 20px 48px rgba(0,0,0,0.60)',
            animation: '0.30s var(--ease-out-quart) menuIn forwards',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Nav links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block"
                  style={{
                    padding: '11px 14px',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#F8FAFC' : 'rgba(255,255,255,0.70)',
                    background: active
                      ? 'rgba(255,255,255,0.08)'
                      : 'transparent',
                    textDecoration: 'none',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Language grid */}
          <div
            style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <p
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                color: 'var(--text-muted)',
                padding: '0 4px 8px',
              }}
            >
              {t('lang.select', 'Language')}
            </p>
            <div className="grid grid-cols-3 gap-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.name as SupportedLanguage);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    padding: '7px 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: language === l.name ? 700 : 400,
                    color: language === l.name ? '#38D9E6' : 'var(--text-main)',
                    background: language === l.name
                      ? 'rgba(56,217,230,0.12)'
                      : 'rgba(255,255,255,0.04)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          {/* Auth CTAs */}
          <div
            style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            {user ? (
              <div className="space-y-2">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center justify-center gap-2 w-full"
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#fff',
                    background: 'linear-gradient(135deg, #477BFF 0%, #38D9E6 100%)',
                    textDecoration: 'none',
                  }}
                >
                  <LayoutDashboard style={{ width: '16px', height: '16px' }} />
                  {t('nav.dashboard', 'Dashboard')}
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full"
                  style={{
                    padding: '11px',
                    borderRadius: '14px',
                    fontSize: '14px',
                    color: '#EF4444',
                    background: 'rgba(239,68,68,0.10)',
                    border: '1px solid rgba(239,68,68,0.20)',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut style={{ width: '15px', height: '15px' }} />
                  {t('nav.signOut', 'Sign Out')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="flex items-center justify-center"
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-main)',
                    background: 'rgba(255,255,255,0.06)',
                    textDecoration: 'none',
                  }}
                >
                  {t('nav.signIn', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center"
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#000',
                    background: '#ffffff',
                    textDecoration: 'none',
                  }}
                >
                  {t('nav.getStarted', 'Get Started')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
