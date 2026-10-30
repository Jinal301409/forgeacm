import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Database, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[var(--bg-surface)] border-t border-[var(--border-color)] text-[var(--text-muted)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#477BFF] to-[#38D9E6] p-[1.5px]">
                <div className="w-full h-full bg-[var(--bg-surface)] rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#38D9E6]" />
                </div>
              </div>
              <span className="font-bold text-lg app-text font-mono tracking-tight">
                CIVICLENS <span className="text-[#38D9E6]">AI</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[var(--text-muted)] max-w-sm">
              CivicLens AI is an intelligent civic infrastructure platform bridging citizens, verified government policies, public scheme discovery, and municipal grievance accountability.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                <Cpu className="w-3 h-3 text-[#38D9E6]" />
                Gemini 3.8 Flash
              </span>
            </div>
          </div>

          {/* Intelligence Modules */}
          <div>
            <h4 className="text-xs font-semibold app-text uppercase tracking-wider mb-4 font-mono">
              Civic Intelligence
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/policies" className="hover:app-text transition-colors">
                  {t('menu.policyExplainer', 'AI Policy Explainer')}
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:app-text transition-colors">
                  {t('nav.schemes', 'Government Schemes')}
                </Link>
              </li>
              <li>
                <Link to="/reports/new" className="hover:app-text transition-colors">
                  {t('menu.reportIssue', 'File Civic Grievance')}
                </Link>
              </li>
              <li>
                <Link to="/fact-check" className="hover:app-text transition-colors">
                  {t('menu.factVerification', 'Fact Verification Engine')}
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:app-text transition-colors">
                  {t('menu.civicMap', 'Live Civic Issue Map')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency & Governance */}
          <div>
            <h4 className="text-xs font-semibold app-text uppercase tracking-wider mb-4 font-mono">
              Transparency
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/transparency" className="hover:app-text transition-colors">
                  {t('nav.transparency', 'Public Civic Pulse')}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:app-text transition-colors">
                  {t('nav.howItWorks', 'AI Grounding Methodology')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:app-text transition-colors">
                  {t('nav.about', 'Institutional Integrity')}
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:app-text transition-colors">
                  {t('nav.features', 'Platform Architecture')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Privacy */}
          <div>
            <h4 className="text-xs font-semibold app-text uppercase tracking-wider mb-4 font-mono">
              Legal & Compliance
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="hover:app-text transition-colors">
                  DPDP Act Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:app-text transition-colors">
                  Terms & Citizen Code
                </Link>
              </li>
              <li>
                <span className="text-xs text-[var(--text-muted)] block pt-1">
                  Official AI Disclaimer: AI analyses are informative and grounded in source gazettes, without replacing formal judicial counsel.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-4">
          <p>© {new Date().getFullYear()} CivicLens AI Platform. Built for Digital Governance & Public Information.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              Secure Data Storage
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Role-Based Access
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
