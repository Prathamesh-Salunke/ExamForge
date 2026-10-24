import React, { useState } from 'react';
import {
  Calendar,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Network,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface SignupPageProps {
  onNavigateToLogin: () => void;
  onSignupSuccess: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onNavigateToLogin,
  onSignupSuccess,
}) => {
  const { signUp, isLoading, authMode } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid academic email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    const res = await signUp({ name, email, password });
    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed.');
    } else {
      setSuccessMessage('Account registered successfully! Logging you into ExamForge...');
      setTimeout(() => {
        onSignupSuccess();
      }, 700);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="w-full max-w-xl bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl p-7 sm:p-10 shadow-2xl shadow-[#438DFF]/10 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#A78BFA] to-[#438DFF] flex items-center justify-center text-white shadow-lg shadow-[#A78BFA]/30">
              <Calendar className="w-7 h-7" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#438DFF] border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
              <Network className="w-3.5 h-3.5" />
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Register for <span className="text-[#438DFF]">ExamForge</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Create an Exam Controller / Faculty account for collision-free scheduling
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EAF4FF] text-[#438DFF] border border-[#438DFF]/25">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {authMode === 'SUPABASE' ? 'Supabase Authentication' : 'Institutional College Directory'}
            </span>
          </div>
        </div>

        {/* Error / Success Alerts */}
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

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Name & Designation
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Prathamesh Salunke (Exam Cell)"
                className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-white/90 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#438DFF]/40 focus:border-[#438DFF]"
              />
            </div>
          </div>

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
                placeholder="prathamesh@college.edu"
                className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-white/90 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#438DFF]/40 focus:border-[#438DFF]"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  className="w-full pl-10 pr-9 py-2.5 text-xs font-medium bg-white/90 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#438DFF]/40 focus:border-[#438DFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-9 py-2.5 text-xs font-medium bg-white/90 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#438DFF]/40 focus:border-[#438DFF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 text-xs font-extrabold text-white bg-gradient-to-r from-[#438DFF] to-[#A78BFA] hover:from-[#2563EB] hover:to-[#9333EA] rounded-xl shadow-lg shadow-[#438DFF]/25 hover:shadow-xl hover:shadow-[#438DFF]/35 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{isLoading ? 'Creating Account...' : 'Create ExamForge Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-7 pt-5 border-t border-slate-200/80 text-center text-xs text-slate-500">
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="font-bold text-[#438DFF] hover:underline"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
