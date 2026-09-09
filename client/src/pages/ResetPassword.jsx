import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [resetCode, setResetCode] = useState(searchParams.get('code') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !resetCode || !newPassword || !confirmPassword) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.resetPassword({
        email: email.trim(),
        resetCode: resetCode.trim(),
        newPassword,
        confirmPassword,
      });

      showToast(res.message || 'Password successfully changed! Please log in.', 'success');
      navigate('/login');
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Failed to reset password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-silk-maroon-950 via-silk-maroon-900 to-stone-950 text-white relative overflow-hidden">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-silk-maroon-800 border border-silk-gold-400 flex items-center justify-center text-silk-gold-300 shadow-xl mb-3">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="font-brand font-bold text-2xl tracking-wider text-silk-gold-200">
            Set New Password
          </h1>
          <p className="text-stone-300 text-xs mt-1">
            Enter your verification code and choose a new secure password
          </p>
        </div>

        <div className="mt-6 bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-silk-gold-400/40 text-stone-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@shivaayahasilks.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="e.g. 583921"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm font-mono tracking-wider focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-silk-maroon-800 to-silk-maroon-900 hover:from-silk-maroon-700 hover:to-silk-maroon-800 text-silk-gold-200 border border-silk-gold-500/50 text-sm font-bold shadow-xl transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? 'Updating Password...' : 'Save & Login'}</span>
              <ArrowRight className="w-4 h-4 text-silk-gold-400" />
            </button>
          </form>

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
