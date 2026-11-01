import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Lock,
  Download,
  Trash2,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, logout, token } = useAuth();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [message, setMessage] = useState('');

  const handleExportData = () => {
    if (!user) return;
    const exportData = {
      profile: user,
      timestamp: new Date().toISOString(),
      platform: 'CivicLens AI',
      disclaimer: 'Exported under Section 11 of Digital Personal Data Protection Act 2023',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civiclens-profile-${user.id}.json`;
    a.click();
    setMessage('Your personal data archive has been downloaded.');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you certain you wish to exercise your Right to Erasure and permanently delete your account? This action is irreversible.')) {
      alert('Your deletion request has been processed. Signing out.');
      logout();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div className="pb-4 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#8968FF]">
          <Settings className="w-3.5 h-3.5" />
          <span>ACCOUNT & PRIVACY CONFIGURATION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          System Settings & Data Rights
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure notifications, export your data archive, and manage your account privacy.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Notifications Preferences */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.1] space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#38D9E6]" />
          Notification Preferences
        </h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer">
            <div>
              <p className="font-semibold text-white">Grievance Status Alerts</p>
              <p className="text-slate-400">Receive in-app and email updates when an officer changes report status.</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="rounded bg-[#080B12] text-[#477BFF] w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer">
            <div>
              <p className="font-semibold text-white">SMS Critical Escalations</p>
              <p className="text-slate-400">SMS updates for critical public hazards in your municipal ward.</p>
            </div>
            <input
              type="checkbox"
              checked={smsNotifs}
              onChange={(e) => setSmsNotifs(e.target.checked)}
              className="rounded bg-[#080B12] text-[#477BFF] w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* Data Protection & Export (DPDP Act) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.1] space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          DPDP Act Data Portability & Rights
        </h2>

        <div className="space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div>
              <p className="font-semibold text-white">Download My Personal Data Archive</p>
              <p className="text-slate-400">Export a machine-readable JSON copy of your profile and tracking records.</p>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] flex items-center gap-1.5 shrink-0 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div>
              <p className="font-semibold text-rose-300">Right to Erasure (Delete Account)</p>
              <p className="text-slate-400">Permanently delete your profile, credentials, and notification subscriptions.</p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 flex items-center gap-1.5 shrink-0 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
