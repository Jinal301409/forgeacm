import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  AlertCircle,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LANGUAGES } from '../../context/LanguageContext';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    state: 'Gujarat',
    city: 'Ahmedabad',
    preferredLanguage: 'English',
    occupation: '',
    category: 'General',
    acceptTerms: true,
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const indianStates = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi (NCT)', 'Gujarat', 'Haryana',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
    'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!formData.acceptTerms) {
      setError('You must accept the Citizen Terms & Privacy Policy to register.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        state: formData.state,
        city: formData.city,
        preferredLanguage: formData.preferredLanguage,
        occupation: formData.occupation,
        category: formData.category,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center relative overflow-hidden auth-canvas bg-[#04060A] px-4 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#477BFF]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl rounded-3xl bg-[#080B12]/90 border border-white/[0.1] shadow-2xl backdrop-blur-2xl p-8 sm:p-10 relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#477BFF] to-[#38D9E6] p-[1.5px]">
              <div className="w-full h-full bg-[#04060A] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#38D9E6]" />
              </div>
            </div>
            <span className="font-bold text-lg text-white font-mono">
              CIVICLENS <span className="text-[#38D9E6]">AI</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Create Your Citizen Account
          </h2>
          <p className="text-xs text-slate-400">
            Access intelligent policy summaries, personalized welfare schemes, and direct grievance tracking.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Full Name *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya Patel"
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
                />
              </div>
            </div>

            {/* Preferred Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Preferred Language</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.name}>
                      {l.name} ({l.nativeName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">State / UT *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
                >
                  {indianStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">City / District *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Ahmedabad"
                className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              className="mt-1 rounded bg-[#080B12] border-white/[0.2] text-[#477BFF] w-4 h-4"
            />
            <label htmlFor="terms" className="ml-2.5 text-xs text-slate-400 leading-normal">
              I accept the{' '}
              <Link to="/terms" className="text-[#38D9E6] hover:underline">
                Citizen Terms of Service
              </Link>{' '}
              and acknowledge that my data is protected under the{' '}
              <Link to="/privacy" className="text-[#38D9E6] hover:underline">
                DPDP Act Privacy Policy
              </Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] hover:from-[#3a6ee8] hover:to-[#2e5fd4] shadow-lg shadow-[#477BFF]/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm mt-4"
          >
            {isSubmitting ? 'Creating Account...' : 'Complete Citizen Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/[0.08]">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#38D9E6] hover:underline font-semibold">
              Sign In Instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
