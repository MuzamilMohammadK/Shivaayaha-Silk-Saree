import React, { useState } from 'react';
import logoImg from '../assets/logo.jpg';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password, rememberMe);
      showToast(res.message || 'Logged in successfully!', 'success');
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Invalid email or password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-silk-maroon-950 via-silk-maroon-900 to-stone-950 text-white relative overflow-hidden">
      
      {/* Decorative Traditional Silk Accent Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-silk-gold-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-silk-maroon-700/20 blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-24 h-24 rounded-full overflow-hidden border-2 border-silk-gold-400 p-1 shadow-2xl bg-silk-maroon-950 mb-4">
            <img src={logoImg} alt="Shivaayaha Silk Sarees" className="w-full h-full object-cover rounded-full" />
          </div>
          <h1 className="font-brand font-bold text-2xl sm:text-3xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-silk-gold-200 via-silk-gold-400 to-silk-gold-300">
            Shivaayaha Silk Sarees
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm mt-1 font-sans">
            Manual Ledger & Paid & Due Bookkeeping
          </p>
          <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-silk-gold-500/10 border border-silk-gold-500/30 text-silk-gold-300 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Offline & Manual Data Entry</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-silk-gold-400/40 text-stone-900">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Owner Email Address
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
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-silk-maroon-800 hover:text-silk-maroon-950 transition"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition font-medium"
                  required
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-silk-maroon-800 border-stone-300 rounded focus:ring-silk-gold-400"
                />
                <span className="text-xs text-stone-700 font-medium">Keep me signed in (30 days)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-silk-maroon-800 via-silk-maroon-700 to-silk-maroon-900 hover:from-silk-maroon-700 hover:to-silk-maroon-800 text-silk-gold-200 border border-silk-gold-500/50 text-sm font-bold shadow-xl transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Open Shivaayaha Ledger'}</span>
              <ArrowRight className="w-4 h-4 text-silk-gold-400" />
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-stone-200 text-center">
            <p className="text-xs text-stone-600">
              New shop or loom owner?{' '}
              <Link to="/register" className="font-bold text-silk-maroon-800 hover:underline">
                Register New Shop Account
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Account Hint */}
        <div className="mt-6 text-center text-xs text-stone-400">
          <p>Shivaayaha Silk Sarees &bull; Wholesale & Retail Bookkeeping</p>
        </div>

      </div>
    </div>
  );
}
