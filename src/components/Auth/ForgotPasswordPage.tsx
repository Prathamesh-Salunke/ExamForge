import React, { useState } from 'react';
import {
  Calendar,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateToLogin,
}) => {
  const { resetPassword, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid college email address.');
      return;
    }

    const res = await resetPassword(email);
    if (!res.success) {
      setErrorMessage(res.error || 'Password reset request could not be processed.');
    } else {
      setSuccessMessage(
        'Password recovery instructions have been dispatched to your email address.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="w-full max-w-md bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-[#438DFF]/10 relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF4FF] text-[#438DFF] flex items-center justify-center mb-3 shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>

          <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Enter your college email address to receive password recovery instructions
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="block font-bold mb-1">Check Your Inbox:</strong>
                <span>{successMessage}</span>
              </div>
            </div>

            <button
              onClick={onNavigateToLogin}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#438DFF] hover:bg-[#2563EB] rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Registered College Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="professor@examforge.edu"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-white/90 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#438DFF]/40 focus:border-[#438DFF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#438DFF] hover:bg-[#2563EB] rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{isLoading ? 'Sending Request...' : 'Send Recovery Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-3 text-center">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
