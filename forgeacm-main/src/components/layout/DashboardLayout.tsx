import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Search,
  AlertCircle,
  Clock,
  MapPin,
  CheckCircle,
  Briefcase,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Users,
  BarChart3,
  ScrollText,
  Globe,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PageBackground, usePageEffect } from '../backgrounds/PageBackground';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const effect = usePageEffect();
  const { language, setLanguage, languages, t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Load unread notifications count
  useEffect(() => {
    if (!token) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const unread = data.notifications.filter((n: any) => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        // silent fail
      }
    };
    fetchUnread();
  }, [token, location.pathname]);

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'admin';
  const isOfficer = user.role === 'officer' || isAdmin;

  // Citizen Links with translation support
  const citizenLinks = [
    { name: t('menu.overview', 'Overview'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('menu.policyExplainer', 'Policy Explainer'), path: '/policies', icon: FileText, badge: 'AI' },
    { name: t('menu.schemeExplorer', 'Scheme Explorer'), path: '/schemes', icon: Search },
    { name: t('menu.reportIssue', 'Report an Issue'), path: '/reports/new', icon: AlertCircle, highlight: true },
    { name: t('menu.trackGrievances', 'Track Grievances'), path: '/tracking', icon: Clock },
    { name: t('menu.civicMap', 'Civic Issue Map'), path: '/map', icon: MapPin },
    { name: t('menu.factVerification', 'Fact Verification'), path: '/fact-check', icon: CheckCircle, badge: 'AI' },
    { name: t('menu.myApplications', 'My Applications'), path: '/applications', icon: Briefcase },
    { name: t('menu.notifications', 'Notifications'), path: '/notifications', icon: Bell, count: unreadCount },
    { name: t('menu.profile', 'My Profile'), path: '/profile', icon: UserIcon },
    { name: t('menu.settings', 'Settings'), path: '/settings', icon: Settings },
  ];

  // Admin / Officer Management Links
  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Complaint Desk', path: '/admin/reports', icon: AlertCircle },
    { name: 'Citizen Directory', path: '/admin/users', icon: Users },
    { name: 'Policy Vault', path: '/admin/policies', icon: FileText },
    { name: 'Analytics & SLA', path: '/admin/analytics', icon: BarChart3 },
    { name: 'System Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
  ];

  const currentLinks = location.pathname.startsWith('/admin') ? adminLinks : citizenLinks;

  const isActive = (path: string) => {
    if (path === '/dashboard' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`min-h-screen app-bg app-text flex flex-col md:flex-row antialiased transition-colors duration-200 ${effect ? 'live-bg-on' : ''}`}>
      <PageBackground />
      {/* Sidebar Desktop */}
      <aside
        className={`hidden md:flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-surface)] transition-all duration-300 relative z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#477BFF] to-[#38D9E6] p-[1.5px] shrink-0">
              <div className="w-full h-full bg-[var(--bg-surface)] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#38D9E6]" />
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base font-mono tracking-tight app-text flex items-center gap-1">
                  CIVICLENS <span className="text-[#38D9E6] text-[10px] px-1 py-0.2 bg-[#38D9E6]/10 rounded">AI</span>
                </span>
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-mono tracking-wider">
                  {user.role} {t('nav.workspace', 'workspace')}
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-[var(--text-muted)] hover:app-text rounded-lg hover:bg-black/5 dark:hover:bg-white/[0.05] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Workspace Switcher (if officer or admin) */}
        {isOfficer && !collapsed && (
          <div className="px-3 pt-3">
            <div className="p-1 bg-black/5 dark:bg-white/[0.04] rounded-xl border border-[var(--border-color)] grid grid-cols-2 text-xs font-medium">
              <button
                onClick={() => navigate('/dashboard')}
                className={`py-1.5 rounded-lg transition-all ${
                  !location.pathname.startsWith('/admin')
                    ? 'bg-[#477BFF] text-white shadow-sm font-semibold'
                    : 'text-[var(--text-muted)] hover:app-text'
                }`}
              >
                {t('nav.citizenHub', 'Citizen Hub')}
              </button>
              <button
                onClick={() => navigate('/admin')}
                className={`py-1.5 rounded-lg transition-all ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-[#477BFF] text-white shadow-sm font-semibold'
                    : 'text-[var(--text-muted)] hover:app-text'
                }`}
              >
                {t('nav.adminHub', 'Admin Desk')}
              </button>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {currentLinks.map((item: any) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-gradient-to-r from-[#477BFF]/20 to-[#8968FF]/10 app-text font-semibold border border-[#477BFF]/30 shadow-sm'
                    : item.highlight
                    ? 'text-[#38D9E6] hover:bg-[#38D9E6]/10 border border-[#38D9E6]/30'
                    : 'text-[var(--text-muted)] hover:app-text hover:bg-black/5 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    active ? 'text-[#38D9E6]' : item.highlight ? 'text-[#38D9E6]' : 'text-[var(--text-muted)]'
                  }`}
                />
                {!collapsed && (
                  <span className="flex-1 truncate text-left">{item.name}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-gradient-to-r from-[#477BFF] to-[#38D9E6] text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
                {!collapsed && item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card at bottom */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-surface-elevated)]">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#477BFF] to-[#8968FF] flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold app-text truncate">{user.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 rounded-lg hover:bg-black/5 dark:hover:bg-white/[0.05] transition-colors"
                title={t('nav.signOut', 'Sign Out')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center p-2 text-[var(--text-muted)] hover:text-rose-500 rounded-lg"
              title={t('nav.signOut', 'Sign Out')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-[var(--bg-surface-header)] backdrop-blur-xl border-b border-[var(--border-color)] flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[var(--text-main)] bg-black/5 dark:bg-white/[0.05] rounded-lg"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Public home link indicator */}
            <Link
              to="/"
              className="text-xs text-[var(--text-muted)] hover:app-text flex items-center gap-1.5 transition-colors"
            >
              <span>{t('app.name', 'CivicLens AI')}</span>
              <span className="opacity-40">/</span>
              <span className="app-text font-semibold capitalize">
                {location.pathname.replace('/', '').replace(/-/g, ' ') || 'Dashboard'}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.08] border border-[var(--border-color)] rounded-xl transition-all shadow-sm"
              >
                <Globe className="w-3.5 h-3.5 text-[#38D9E6]" />
                <span className="hidden sm:inline">{language}</span>
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-card)] shadow-2xl py-1.5 z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">
                    {t('lang.select', 'Select Language')}
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.name as SupportedLanguage);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/[0.06] ${
                        language === l.name ? 'text-[#38D9E6] font-semibold bg-[#38D9E6]/10' : 'text-[var(--text-main)]'
                      }`}
                    >
                      <span>{l.name}</span>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">{l.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[var(--text-main)] bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.08] border border-[var(--border-color)] rounded-xl transition-all shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-600" />
              )}
            </button>

            {/* Notifications Button */}
            <Link
              to="/notifications"
              className="relative p-2 text-[var(--text-main)] bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.08] border border-[var(--border-color)] rounded-xl transition-all shadow-sm"
              title={t('menu.notifications', 'Notifications')}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Quick Action: File Grievance */}
            <Link
              to="/reports/new"
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#38D9E6] hover:opacity-95 rounded-xl shadow-sm shadow-[#477BFF]/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('dash.reportIssue', 'Report Issue')}</span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-[var(--bg-surface)] border-b border-[var(--border-color)] p-4 space-y-2 z-20">
            {currentLinks.map((item: any) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                    isActive(item.path) ? 'bg-[#477BFF] text-white' : 'text-[var(--text-muted)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Nested Page Content with subtle scroll */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 app-bg app-text">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
