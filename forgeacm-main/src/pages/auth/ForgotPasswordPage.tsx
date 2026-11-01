import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, KeyRound, ArrowRight, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request reset code.');

      setMessage(data.message || 'Reset code generated.');
      if (data.demoOtp) {
        setDemoOtp(data.demoOtp);
        setOtp(data.demoOtp);
      }
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password.');

      setSuccess(true);
      setMessage(data.message || 'Password successfully updated.');
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
            {step === 1 ? 'Enter your registered email to receive a secure 6-digit reset code.' : 'Enter the 6-digit OTP code and choose your new password.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {demoOtp && step === 2 && !success && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Mode Active (No SMTP Configured)</span>
            </div>
            <p>Your one-time 6-digit reset code is: <strong className="font-mono text-white text-sm bg-black/40 px-2 py-0.5 rounded">{demoOtp}</strong></p>
          </div>
        )}

        {success ? (
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
        ) : step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Registered Email Address</label>
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

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] disabled:opacity-50 transition-all text-sm"
            >
              {loading ? 'Sending Code...' : 'Send 6-Digit Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">6-Digit Verification Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-white tracking-widest focus:outline-none focus:border-[#477BFF]"
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
                  placeholder="Minimum 8 characters"
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 rounded-xl border border-white/[0.1] text-slate-300 text-xs"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6 || newPassword.length < 8}
                className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] disabled:opacity-50 text-xs"
              >
                {loading ? 'Validating...' : 'Set New Password'}
              </button>
            </div>
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