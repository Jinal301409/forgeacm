import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password reset failed.');
      }

      setSubmitted(true);
      setMessage(data.message || 'Your password has been reset successfully.');
    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center relative overflow-hidden auth-canvas bg-[#04060A] px-4">
      <div className="w-full max-w-md rounded-3xl bg-[#080B12]/90 border border-white/[0.1] shadow-2xl backdrop-blur-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#477BFF] to-[#38D9E6] p-[1.5px]">
              <div className="w-full h-full bg-[#04060A] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#38D9E6]" />
              </div>
            </div>
            <span className="font-bold text-base text-white font-mono">
              CIVICLENS <span className="text-[#38D9E6]">AI</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white">Reset Account Password</h2>
          <p className="text-xs text-slate-400">
            Enter your registered email and your new password to restore access.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-emerald-300">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#477BFF] px-4 py-2 rounded-xl"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] disabled:opacity-50 transition-all text-sm"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-white/[0.08]">
          <Link to="/login" className="text-xs text-slate-400 hover:text-white">
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
