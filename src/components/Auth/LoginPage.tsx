import React, { useState } from 'react';
import {
  Calendar,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Network,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface LoginPageProps {
  onNavigateToSignup: () => void;
  onNavigateToForgotPassword: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToSignup,
  onNavigateToForgotPassword,
  onLoginSuccess,
}) => {
  const { signIn, isLoading, authMode } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your college email and password.');
      return;
    }

    const res = await signIn({ email, password, rememberMe });
    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
    } else {
      setSuccessMessage('Welcome back! Logging into ExamForge...');
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    }
  };

  const fillDemoAccount = () => {
    setEmail('professor@examforge.edu');
    setPassword('Admin@2026');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      {/* Glassmorphic Login Card */}
      <div className="w-full max-w-xl bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl p-7 sm:p-10 shadow-2xl shadow-[#438DFF]/10 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#438DFF] to-[#A78BFA] flex items-center justify-center text-white shadow-lg shadow-[#438DFF]/30">
              <Calendar className="w-7 h-7" />
            </div>
            {/* Small floating node badge */}
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
              <Network className="w-3.5 h-3.5" />
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Sign In to <span className="text-[#438DFF]">ExamForge</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Smarter Examination Scheduling, Powered by Graph Coloring
          </p>

          {/* Active Auth Provider Badge */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EAF4FF] text-[#438DFF] border border-[#438DFF]/25">
            <ShieldCheck className="w-3.5 h-3.5 text-[#438DFF]" />
            <span>
              {authMode === 'SUPABASE'
                ? 'Supabase Cloud Authentication Active'
                : 'Institutional College Auth Active'}
            </span>
          </div>
        </div>

        {/* 1-Click Professor Evaluator Demo Shortcut */}
        <div className="mb-6 p-3.5 bg-gradient-to-r from-[#EAF4FF] to-[#F5F3FF] border border-[#438DFF]/20 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            <div>
              <span className="font-bold text-[#0F172A] block">Faculty / Evaluator Demo Account:</span>
              <span className="text-slate-600 font-mono text-[11px]">
                professor@examforge.edu • Admin@2026
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={fillDemoAccount}
            className="px-3 py-1.5 text-xs font-bold text-white bg-[#438DFF] hover:bg-[#2563EB] rounded-xl shadow-xs transition"
          >
            Auto-Fill
          </button>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="font-medium">{successMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              College Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="controller@college.edu or professor@examforge.edu"
                className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-white/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#438DFF]/40 focus:border-[#438DFF] transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={onNavigateToForgotPassword}
                className="text-xs font-semibold text-[#438DFF] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-2.5 text-xs font-medium bg-white/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#438DFF]/40 focus:border-[#438DFF] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#438DFF] accent-[#438DFF] focus:ring-[#438DFF]"
              />
              <span>Remember this session on this computer</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 text-xs font-extrabold text-white bg-gradient-to-r from-[#438DFF] to-[#3B82F6] hover:from-[#2563EB] hover:to-[#1D4ED8] rounded-xl shadow-lg shadow-[#438DFF]/25 hover:shadow-xl hover:shadow-[#438DFF]/35 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to ExamForge'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Nav */}
        <div className="mt-7 pt-5 border-t border-slate-200/80 text-center text-xs text-slate-500">
          <span>New Examination Controller or Faculty? </span>
          <button
            type="button"
            onClick={onNavigateToSignup}
            className="font-bold text-[#438DFF] hover:underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
