import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  FileText,
  Search,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const CitizenDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/dashboard/citizen', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load citizen dashboard data:', err);
        setLoading(false);
      });
  }, [token]);

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 app-bg app-text transition-colors duration-200">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl app-banner border border-[var(--border-card)] p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/[0.05] border border-[var(--border-color)] text-xs font-mono text-[#38D9E6] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('app.track', 'CITIZEN INTELLIGENCE PORTAL')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold app-text tracking-tight">
              {t('dash.greeting', 'Good day')}, {user.name}
            </h1>
            <p className="text-sm text-[var(--text-muted)] max-w-xl">
              {t('dash.subtitle', 'Your civic intelligence, all in one place. Track municipal grievances, explore eligible government benefits, and verify public circulars.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/reports/new"
              className="px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] hover:opacity-95 shadow-lg shadow-[#477BFF]/25 flex items-center gap-2 text-sm transition-all"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{t('dash.reportIssue', 'Report Civic Issue')}</span>
            </Link>
            <Link
              to="/policies"
              className="px-4 py-2.5 rounded-xl font-medium app-text bg-black/5 dark:bg-white/[0.05] hover:bg-black/10 dark:hover:bg-white/[0.09] border border-[var(--border-color)] flex items-center gap-2 text-sm transition-all"
            >
              <FileText className="w-4 h-4 text-[#38D9E6]" />
              <span>{t('dash.explainPolicy', 'Explain Policy')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 rounded-2xl border border-[var(--border-card)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              {t('dash.activeReports', 'My Active Reports')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold app-text font-mono">
            {data?.metrics?.activeReportsCount ?? 1}
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">Scheduled for field review</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-card)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">
              {t('dash.resolvedIssues', 'Resolved Issues')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {data?.metrics?.resolvedReportsCount ?? 1}
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">Successfully remediated</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-card)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#38D9E6] uppercase tracking-wider font-semibold">
              {t('dash.savedSchemes', 'Saved Schemes')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#38D9E6]/10 text-[#38D9E6] flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#38D9E6] font-mono">
            {data?.metrics?.savedSchemesCount ?? 2}
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">Bookmarked for application</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[var(--border-card)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#8968FF] uppercase tracking-wider font-semibold">
              {t('dash.trackedServices', 'Tracked Services')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#8968FF]/10 text-[#8968FF] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#8968FF] font-mono">
            {data?.metrics?.applicationsCount ?? 2}
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">Step-by-step assistant active</p>
        </div>
      </div>

      {/* Main Grid: Grievance Status & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: My Recent Grievances (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold app-text flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              {t('dash.myGrievances', 'My Civic Grievance Reports')}
            </h2>
            <Link to="/tracking" className="text-xs text-[#38D9E6] hover:underline flex items-center gap-1 font-semibold">
              {t('dash.viewAll', 'View All')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.myRecentReports || []).map((rep: any) => (
              <div
                key={rep.id}
                className="glass-card p-4 rounded-2xl border border-[var(--border-card)] space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[var(--text-muted)] font-semibold">{rep.reportId}</span>
                      <span className="opacity-40">•</span>
                      <span className="text-xs text-[var(--text-muted)]">{rep.category}</span>
                    </div>
                    <h3 className="text-sm font-semibold app-text">{rep.title}</h3>
                  </div>
                  <StatusBadge status={rep.status} size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)]">
                  <span className="flex items-center gap-1 truncate max-w-[280px]">
                    <MapPin className="w-3.5 h-3.5 text-[#477BFF] shrink-0" />
                    <span className="truncate">{rep.location}</span>
                  </span>
                  <Link
                    to={`/reports/${rep.reportId}`}
                    className="text-[#38D9E6] hover:underline font-semibold shrink-0 ml-2"
                  >
                    Details & Timeline →
                  </Link>
                </div>
              </div>
            ))}

            {(!data?.myRecentReports || data.myRecentReports.length === 0) && (
              <div className="p-8 rounded-2xl glass-card text-center space-y-3">
                <p className="text-sm text-[var(--text-muted)]">No active grievances filed yet.</p>
                <Link
                  to="/reports/new"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#477BFF] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> File Your First Civic Issue
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Public Applications & Recommended Schemes (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Public Service Applications Assistant */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold app-text flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#8968FF]" />
                {t('dash.publicApplications', 'Public Service Applications')}
              </h2>
              <Link to="/applications" className="text-xs text-[#38D9E6] hover:underline font-semibold">
                {t('dash.viewAll', 'View All')}
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.myApplications || []).map((app: any) => (
                <div key={app.id} className="p-4 rounded-xl glass-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold app-text truncate max-w-[200px]">
                      {app.serviceName}
                    </span>
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-mono">
                      <span>Progress</span>
                      <span className="font-bold">{app.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/[0.08] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#477BFF] to-[#38D9E6] rounded-full"
                        style={{ width: `${app.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Tool Links */}
          <div className="p-5 rounded-2xl glass-card space-y-3">
            <h3 className="text-sm font-bold app-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {t('dash.aiHub', 'Civic AI Intelligence Hub')}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/policies"
                className="p-3 rounded-xl bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.08] border border-[var(--border-color)] text-[var(--text-main)] transition-all space-y-1 shadow-sm"
              >
                <p className="font-semibold">{t('menu.policyExplainer', 'Policy Explainer')}</p>
                <p className="text-[11px] text-[var(--text-muted)]">Gazette to plain guide</p>
              </Link>
              <Link
                to="/schemes"
                className="p-3 rounded-xl bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.08] border border-[var(--border-color)] text-[var(--text-main)] transition-all space-y-1 shadow-sm"
              >
                <p className="font-semibold">{t('menu.schemeExplorer', 'Scheme Finder')}</p>
                <p className="text-[11px] text-[var(--text-muted)]">Match your profile</p>
              </Link>
              <Link
                to="/fact-check"
                className="p-3 rounded-xl bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.08] border border-[var(--border-color)] text-[var(--text-main)] transition-all space-y-1 shadow-sm"
              >
                <p className="font-semibold">{t('menu.factVerification', 'Fact Verification')}</p>
                <p className="text-[11px] text-[var(--text-muted)]">Check viral claims</p>
              </Link>
              <Link
                to="/map"
                className="p-3 rounded-xl bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.08] border border-[var(--border-color)] text-[var(--text-main)] transition-all space-y-1 shadow-sm"
              >
                <p className="font-semibold">{t('menu.civicMap', 'Civic Issue Map')}</p>
                <p className="text-[11px] text-[var(--text-muted)]">Spatial overview</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
