import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, FileText, Plus, Receipt, CreditCard, UserPlus, X } from 'lucide-react';

export default function MobileNav({ onOpenBillModal, onOpenPaymentModal, onOpenPartyModal }) {
  const location = useLocation();
  const [showQuickActions, setShowQuickActions] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Quick Actions Bottom Sheet Overlay */}
      {showQuickActions && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex flex-col justify-end md:hidden animate-in fade-in duration-150"
          onClick={() => setShowQuickActions(false)}
        >
          <div 
            className="bg-silk-maroon-950 border-t-2 border-silk-gold-500/50 p-5 rounded-t-3xl space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-silk-gold-400"></span>
                <p className="font-brand text-sm font-bold text-silk-gold-200">Manual Ledger Entry</p>
              </div>
              <button 
                onClick={() => setShowQuickActions(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-full bg-stone-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setShowQuickActions(false);
                onOpenBillModal();
              }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-silk-maroon-900 border border-silk-gold-500/30 text-white active:scale-95 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-silk-maroon-800 flex items-center justify-center text-silk-gold-400 shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-silk-gold-100">Log New Saree Lot Bill</p>
                <p className="text-xs text-stone-400">Add wholesale lot #, gross amount & advance</p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowQuickActions(false);
                onOpenPaymentModal();
              }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-silk-gold-500 to-silk-gold-600 text-stone-950 font-bold active:scale-95 transition shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-950/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-stone-950" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-stone-950">Record Manual Payment (Paid)</p>
                <p className="text-xs text-stone-900/80">Cash, Manual UPI UTR, Cheque voucher</p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowQuickActions(false);
                onOpenPartyModal();
              }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 active:scale-95 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-silk-gold-400 shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-stone-200">Add Weaver / Wholesale Party</p>
                <p className="text-xs text-stone-400">Register name, phone, hub & opening Ledger</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Android Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-silk-maroon-950/98 backdrop-blur-md border-t border-silk-gold-500/30 safe-pb shadow-2xl">
        <div className="flex items-center justify-around px-2 py-1.5">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              isActive('/dashboard') ? 'text-silk-gold-300 font-semibold' : 'text-stone-400'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Dashboard</span>
          </Link>

          <Link
            to="/parties"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              isActive('/parties') ? 'text-silk-gold-300 font-semibold' : 'text-stone-400'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Weavers</span>
          </Link>

          {/* Elevated Center Action Button for Android */}
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center justify-center w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-silk-gold-600 via-silk-gold-400 to-silk-gold-300 text-stone-950 shadow-lg border-2 border-silk-maroon-950 active:scale-95 transition"
            aria-label="Open manual entry options"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          <Link
            to="/invoices"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              isActive('/invoices') ? 'text-silk-gold-300 font-semibold' : 'text-stone-400'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Lot Bills</span>
          </Link>

          <button
            onClick={onOpenPaymentModal}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-stone-400 transition hover:text-silk-gold-300"
          >
            <CreditCard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Pay Paid</span>
          </button>
        </div>
      </nav>
    </>
  );
}
