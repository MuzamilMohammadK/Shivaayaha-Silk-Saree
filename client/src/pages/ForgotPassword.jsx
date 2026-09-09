import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowRight, KeyRound, ArrowLeft, Copy, Check } from 'lucide-react';

export default function ForgotPassword() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetCode, setResetCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showToast('Please enter your registered email address.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.forgotPassword({ email });
      showToast('Verification reset code generated!', 'success');
      if (res.resetCode) {
        setResetCode(res.resetCode);
      }
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Failed to request reset.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (resetCode) {
      navigator.clipboard.writeText(resetCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Reset code copied to clipboard!', 'info');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-silk-maroon-950 via-silk-maroon-900 to-stone-950 text-white relative overflow-hidden">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-silk-maroon-800 border border-silk-gold-400 flex items-center justify-center text-silk-gold-300 shadow-xl mb-3">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="font-brand font-bold text-2xl tracking-wider text-silk-gold-200">
            Account Recovery
          </h1>
          <p className="text-stone-300 text-xs mt-1">
            Request a time-bound verification code to reset your password
          </p>
        </div>

        <div className="mt-6 bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-silk-gold-400/40 text-stone-900">
          {!resetCode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@shivaayahasilks.com"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition font-medium"
                    required
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  We'll generate a secure 6-digit verification code valid for 15 minutes.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-silk-maroon-800 to-silk-maroon-900 hover:from-silk-maroon-700 hover:to-silk-maroon-800 text-silk-gold-200 border border-silk-gold-500/50 text-sm font-bold shadow-xl transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{loading ? 'Generating Code...' : 'Generate Reset Code'}</span>
                <ArrowRight className="w-4 h-4 text-silk-gold-400" />
              </button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                  Your 6-Digit Verification Code
                </p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <span className="font-mono text-3xl font-extrabold tracking-widest text-silk-maroon-900">
                    {resetCode}
                  </span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-amber-700 mt-2">
                  This code expires in 15 minutes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${resetCode}`)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-silk-gold-500 to-silk-gold-600 hover:from-silk-gold-400 hover:to-silk-gold-500 text-stone-950 text-sm font-bold shadow-xl transition flex items-center justify-center gap-2"
              >
                <span>Proceed to Set New Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-stone-200 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-silk-maroon-800 transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
