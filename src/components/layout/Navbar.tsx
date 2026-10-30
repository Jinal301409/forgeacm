import React, { useState } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, languages, t } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: t('nav.features', 'Features'), path: '/features' },
    { name: t('nav.howItWorks', 'How It Works'), path: '/how-it-works' },
    { name: t('nav.transparency', 'Civic Transparency'), path: '/transparency' },
    { name: t('nav.schemes', 'Schemes'), path: '/schemes' },
    { name: t('nav.policies', 'Policies'), path: '/policies' },
    { name: t('nav.about', 'About'), path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-surface-header)] backdrop-blur-xl border-b border-[var(--border-color)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#477BFF] via-[#8968FF] to-[#38D9E6] p-[1.5px] shadow-lg shadow-[#477BFF]/20 group-hover:shadow-[#477BFF]/40 transition-all">
              <div className="w-full h-full bg-[var(--bg-surface)] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#38D9E6] transition-transform group-hover:scale-110" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight app-text flex items-center gap-1.5 font-mono">
                {t('app.name', 'CIVICLENS AI')} <span className="text-[#38D9E6] text-xs px-1.5 py-0.5 rounded bg-[#38D9E6]/10 border border-[#38D9E6]/30">AI</span>
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium tracking-wider uppercase">
                {t('app.tagline', 'Understand • Verify • Act')}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'app-text font-semibold bg-black/5 dark:bg-white/[0.08] shadow-sm'
                    : 'text-[var(--text-muted)] hover:app-text hover:bg-black/5 dark:hover:bg-white/[0.04]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-main)] bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.08] border border-[var(--border-color)] rounded-xl transition-all shadow-sm"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#38D9E6]" />
                <span className="font-semibold">{language}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-card)] shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">
                    {t('lang.select', 'Select Language')}
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.name as SupportedLanguage);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors ${
                        language === l.name ? 'text-[#38D9E6] font-semibold bg-[#38D9E6]/10' : 'text-[var(--text-main)]'
                      }`}
                    >
                      <span className="font-medium">{l.name}</span>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">{l.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark/Light Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[var(--text-main)] bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.08] border border-[var(--border-color)] rounded-xl transition-all shadow-sm"
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-600" />
              )}
            </button>

            {/* Auth CTA */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#8968FF] hover:opacity-95 rounded-xl shadow-md shadow-[#477BFF]/20 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t('nav.dashboard', 'Dashboard')}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-black/25">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-[var(--text-muted)] hover:text-rose-500 bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.08] border border-[var(--border-color)] rounded-xl transition-all"
                  title={t('nav.signOut', 'Sign Out')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/[0.05] rounded-xl transition-all"
                >
                  {t('nav.signIn', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#477BFF] hover:bg-[#386df0] rounded-xl shadow-lg shadow-[#477BFF]/25 hover:shadow-[#477BFF]/40 transition-all duration-200"
                >
                  <span>{t('nav.getStarted', 'Get Started')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-[var(--text-main)] bg-black/5 dark:bg-white/[0.05] rounded-xl"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-cyan-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/[0.05] rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--bg-surface)] border-b border-[var(--border-color)] px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-medium ${
                  isActive(link.path)
                    ? 'app-text font-bold bg-black/5 dark:bg-white/[0.1]'
                    : 'text-[var(--text-muted)] hover:app-text'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Language Switcher in Mobile Drawer */}
          <div className="pt-2 border-t border-[var(--border-color)]">
            <p className="text-xs font-mono uppercase text-[var(--text-muted)] px-3 mb-1.5">
              {t('lang.select', 'Select Language')}:
            </p>
            <div className="grid grid-cols-2 gap-1.5 px-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.name as SupportedLanguage);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                    language === l.name
                      ? 'bg-[#38D9E6]/20 text-[#38D9E6] font-bold'
                      : 'text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
            {user ? (
              <div className="space-y-2">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#477BFF] rounded-xl"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t('nav.dashboard', 'Dashboard')}</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-rose-500 bg-rose-500/10 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.signOut', 'Sign Out')}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-[var(--text-main)] bg-black/5 dark:bg-white/[0.05] rounded-xl"
                >
                  {t('nav.signIn', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#477BFF] rounded-xl"
                >
                  {t('nav.getStarted', 'Get Started')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
