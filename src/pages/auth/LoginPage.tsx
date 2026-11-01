import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'citizen' | 'officer' | 'admin') => {
    setError('');
    setIsSubmitting(true);
    try {
      await quickLogin(role);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with demo account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center relative overflow-hidden auth-canvas bg-transparent px-4 sm:px-6 lg:px-8">
      {/* Background ambient glowing gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#477BFF]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#8968FF]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-5xl my-10 grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-[#080B12]/80 border border-white/[0.1] shadow-2xl backdrop-blur-2xl overflow-hidden relative z-10">
        {/* Left Side: Brand & Visual Hero */}
        <div className="lg:col-span-5 p-8 sm:p-12 bg-gradient-to-br from-[#080B12] via-[#0E1528] to-[#141C33] border-b lg:border-b-0 lg:border-r border-white/[0.08] flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#477BFF] via-[#8968FF] to-[#38D9E6] p-[1.5px] shadow-lg shadow-[#477BFF]/30">
                <div className="w-full h-full bg-[#04060A] rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#38D9E6]" />
                </div>
              </div>
              <span className="font-bold text-xl text-white font-mono tracking-tight">
                CIVICLENS <span className="text-[#38D9E6]">AI</span>
              </span>
            </Link>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Welcome back to your civic command center.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Log in to check public scheme eligibility, track local infrastructure grievances, and analyze policy gazettes.
              </p>
            </div>

            {/* Quick Demo Logins Section */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Demo Access</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Test the platform immediately with one-click pre-seeded credentials:
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('citizen')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-all flex items-center justify-between"
                >
                  <span>Citizen (Priya Patel — Small Business)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('officer')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-all flex items-center justify-between"
                >
                  <span>Civic Officer (Vikram Sharma — Roads Dept)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-all flex items-center justify-between"
                >
                  <span>Administrator (Dr. Rajeshwari Sen)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 pt-4 border-t border-white/[0.06]">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>256-Bit SSL Encrypted Session</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Sign In to Your Account</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials or use the demo accounts on the left.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF] focus:ring-1 focus:ring-[#477BFF] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <Link to="/forgot-password" className="text-xs text-[#38D9E6] hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF] focus:ring-1 focus:ring-[#477BFF] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#080B12] border-white/[0.2] text-[#477BFF] focus:ring-0 w-4 h-4"
                />
                <label htmlFor="remember" className="ml-2 text-xs text-slate-400 cursor-pointer">
                  Remember this device for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] hover:from-[#3a6ee8] hover:to-[#2e5fd4] shadow-lg shadow-[#477BFF]/25 hover:shadow-[#477BFF]/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Don't have an account yet?{' '}
                <Link to="/register" className="text-[#38D9E6] hover:underline font-semibold">
                  Register Free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
