import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Users, 
  FileText, 
  PlusCircle, 
  LogOut, 
  Receipt, 
  CreditCard,
  UserPlus,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export default function Navbar({ onOpenBillModal, onOpenPaymentModal, onOpenPartyModal }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: BookOpen },
    { label: 'Weavers & Parties', path: '/parties', icon: Users },
    { label: 'Lot Invoices', path: '/invoices', icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-silk-maroon-950 via-silk-maroon-900 to-silk-maroon-950 text-white border-b border-silk-gold-500/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Identity */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-silk-gold-400 p-0.5 shadow-md group-hover:scale-105 transition-transform bg-silk-maroon-950 shrink-0">
              <img src="/logo.jpg" alt="Shivaayaha Silk Sarees" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-brand font-bold text-lg sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-silk-gold-200 via-silk-gold-400 to-silk-gold-300 tracking-wider">
                  Shivaayaha Silk Sarees
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-silk-gold-500/20 text-silk-gold-300 rounded border border-silk-gold-400/40">
                  Manual Ledger
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-300 font-sans tracking-wide">
                Dharmavaram &bull; Traditional Silk Lot Book
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-silk-maroon-800 text-silk-gold-200 border border-silk-gold-400/40 shadow-inner'
                      : 'text-stone-300 hover:text-white hover:bg-silk-maroon-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-silk-gold-400' : 'text-stone-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Quick Action Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={onOpenBillModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-silk-maroon-800/80 hover:bg-silk-maroon-700 text-silk-gold-200 border border-silk-gold-500/40 text-xs font-semibold shadow-sm transition"
              title="Manual Invoice / Lot Entry"
            >
              <Receipt className="w-4 h-4 text-silk-gold-400" />
              <span>+ New Bill Lot</span>
            </button>

            <button
              onClick={onOpenPartyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-silk-gold-500 to-silk-gold-600 hover:from-silk-gold-400 hover:to-silk-gold-500 text-stone-950 font-bold text-xs shadow-md transition"
              title="Register Weaver / Wholesale Party"
            >
              <UserPlus className="w-4 h-4 text-stone-950" />
              <span>+ Add Weaver</span>
            </button>
          </div>

          {/* User Profile & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end mr-1 text-right">
              <span className="text-xs font-semibold text-silk-gold-200">{user?.name || 'Shop Owner'}</span>
              <span className="text-[10px] text-stone-400">{user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center justify-center p-2 rounded-xl text-stone-300 hover:text-rose-300 hover:bg-silk-maroon-800/70 border border-stone-700/60 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-silk-gold-300 hover:bg-silk-maroon-800 border border-silk-gold-500/30"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-silk-gold-500/20 bg-silk-maroon-950/98 px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <p className="text-xs text-stone-400">Signed in as</p>
              <p className="text-sm font-semibold text-silk-gold-200">{user?.name}</p>
              <p className="text-xs text-stone-400">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-rose-950/60 text-rose-300 border border-rose-800/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBillModal();
              }}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-silk-maroon-800 text-silk-gold-200 border border-silk-gold-400/40 text-xs font-semibold"
            >
              <Receipt className="w-4 h-4 text-silk-gold-400" />
              <span>+ New Bill Lot</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPartyModal();
              }}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-gradient-to-r from-silk-gold-500 to-silk-gold-600 text-stone-950 text-xs font-bold shadow"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Weaver</span>
            </button>
          </div>

          <div className="space-y-1 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    active
                      ? 'bg-silk-maroon-800 text-silk-gold-200 border border-silk-gold-500/30'
                      : 'text-stone-300 hover:bg-silk-maroon-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-silk-gold-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
