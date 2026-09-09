import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await register(name, email, password, confirmPassword);
      showToast(res.message || 'Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-silk-maroon-950 via-silk-maroon-900 to-stone-950 text-white relative overflow-hidden">
      
      {/* Decorative Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-silk-gold-500/10 blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full overflow-hidden border-2 border-silk-gold-400 p-1 shadow-2xl bg-silk-maroon-950 mb-3">
            <img src="/logo.jpg" alt="Shivaayaha Silk Sarees" className="w-full h-full object-cover rounded-full" />
          </div>
          <h1 className="font-brand font-bold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-silk-gold-200 via-silk-gold-400 to-silk-gold-300">
            Shivaayaha Silk Sarees
          </h1>
          <p className="text-stone-300 text-xs mt-1">Register Shop Owner / Master Account</p>
        </div>

        {/* Register Card */}
        <div className="mt-6 bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-silk-gold-400/40 text-stone-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                Shop Owner Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shivaayaha Garu / Venkata Raman"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                Email Address <span className="text-rose-500">*</span>
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
                Create Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition font-medium"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-silk-maroon-800 via-silk-maroon-700 to-silk-maroon-900 hover:from-silk-maroon-700 hover:to-silk-maroon-800 text-silk-gold-200 border border-silk-gold-500/50 text-sm font-bold shadow-xl transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4 text-silk-gold-400" />
            </button>
          </form>

          {/* Already have account */}
          <div className="mt-5 pt-4 border-t border-stone-200 text-center">
            <p className="text-xs text-stone-600">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-silk-maroon-800 hover:underline">
                Sign In to Ledger
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
