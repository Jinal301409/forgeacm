import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LANGUAGES, SupportedLanguage } from '../../context/LanguageContext';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [state, setState] = useState(user?.state || 'Gujarat');
  const [city, setCity] = useState(user?.city || 'Ahmedabad');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'English');
  const [occupation, setOccupation] = useState(user?.occupation || 'Small Business Owner');
  const [annualIncome, setAnnualIncome] = useState(user?.annualIncome || 450000);
  const [category, setCategory] = useState(user?.category || 'General');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);

    try {
      await updateProfile({
        name,
        phone,
        state,
        city,
        preferredLanguage,
        occupation,
        annualIncome: Number(annualIncome),
        category,
      });
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div className="pb-4 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#38D9E6]">
          <UserIcon className="w-3.5 h-3.5" />
          <span>CITIZEN DEMOGRAPHIC PROFILE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Citizen Profile & Eligibility Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Keep your location and occupation updated for accurate government welfare scheme matching.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.1] space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-white/[0.08]">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#477BFF] to-[#8968FF] flex items-center justify-center text-white text-xl font-bold font-mono">
            {user.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
            <p className="text-xs text-slate-400">{user.email}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.05] text-[#38D9E6] border border-white/[0.08]">
              <Shield className="w-3 h-3" /> {user.role} Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Contact Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">State / Union Territory</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">City / Municipal Ward</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Preferred Interface Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.name}>
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Occupation / Profession</label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Annual Household Income (₹)</label>
            <input
              type="number"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(Number(e.target.value))}
              className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Social Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white"
            >
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/[0.08]">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] hover:opacity-95 text-xs shadow-lg shadow-[#477BFF]/25 transition-all"
          >
            {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
