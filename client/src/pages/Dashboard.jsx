import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { formatINR, formatDate, getStatusStyle, getPaymentModeDetails } from '../utils/formatters';
import StatCard from '../components/StatCard';
import { 
  Receipt, 
  CreditCard, 
  UserPlus, 
  ArrowUpRight, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  BookOpen, 
  Scale, 
  TrendingUp, 
  Sparkles,
  Smartphone
} from 'lucide-react';

export default function Dashboard({ onOpenBillModal, onOpenPaymentModal, onOpenPartyModal }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getOverview();
      if (res.success) {
        setData(res);
      }
    } catch (error) {
      console.error('Failed to load dashboard overview:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const stats = data?.stats || {
    totalParties: 0,
    totalBills: 0,
    totalBillValue: 0,
    totalPaidJama: 0,
    totalOutstandingBaki: 0,
    totalOpeningBalance: 0,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
      
      {/* Top Banner / Quick Action Bar */}
      <div className="bg-gradient-to-r from-silk-maroon-950 via-silk-maroon-900 to-silk-maroon-950 rounded-3xl p-5 sm:p-7 border border-silk-gold-500/40 text-white shadow-xl relative overflow-hidden">
        
        {/* Subtle decorative gold motif in background */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-silk-gold-500/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-silk-gold-500/20 border border-silk-gold-400/40 text-silk-gold-300 text-xs font-semibold mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>Dharmavaram & Kanchipuram Silk Ledger</span>
            </div>
            <h1 className="font-brand font-bold text-2xl sm:text-3xl text-silk-gold-200 tracking-wide">
              Shivaayaha Silk Sarees Ledger
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">
              100% manual bookkeeping ledger for weaver lot purchases, advance payments, and cash/UPI repayment vouchers.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenBillModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-silk-maroon-800 hover:bg-silk-maroon-700 text-silk-gold-200 border border-silk-gold-500/40 font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
            >
              <Receipt className="w-4 h-4 text-silk-gold-400" />
              <span>+ New Bill Lot</span>
            </button>

            <button
              onClick={onOpenPaymentModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-silk-gold-500 to-silk-gold-600 hover:from-silk-gold-400 hover:to-silk-gold-500 text-stone-950 font-extrabold text-xs sm:text-sm shadow-lg transition active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>+ Record Payment</span>
            </button>

            <button
              onClick={onOpenPartyModal}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-900/80 hover:bg-stone-900 text-stone-300 border border-stone-700 font-semibold text-xs sm:text-sm transition"
            >
              <UserPlus className="w-4 h-4 text-silk-gold-400" />
              <span className="hidden sm:inline">+ Add Weaver</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards: Total Bill Value, Total Paid, Total Outstanding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Total Bill Value */}
        <StatCard
          title="Total Bill Value"
          amount={stats.totalBillValue}
          subtitle={`Across ${stats.totalBills} purchase lot bills`}
          icon={Receipt}
          variant="maroon"
          badgeText="Total Purchases"
        />

        {/* 2. Total Amount Paid */}
        <StatCard
          title="Total Amount Paid"
          amount={stats.totalPaidJama}
          subtitle="Advances & payment vouchers"
          icon={CreditCard}
          variant="emerald"
          badgeText="Settled"
        />

        {/* 3. Total Balance Due */}
        <StatCard
          title="Balance Due"
          amount={stats.totalOutstandingBaki}
          subtitle="Current payable to weavers & mills"
          icon={Scale}
          variant="rose"
          badgeText="Pending"
        />

        {/* 4. Active Weavers & Hubs */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Registered Parties
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              {stats.totalParties} <span className="text-sm font-medium text-stone-500">Weavers</span>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">Historic Opening Ledger:</span>
            <span className="font-bold text-stone-800">{formatINR(stats.totalOpeningBalance)}</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Pending Balances Table + Recent Lot Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Weavers with Pending Balances */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
            <div>
              <h2 className="font-brand font-bold text-lg text-stone-900 flex items-center gap-2">
                <span>Top Outstanding Balances (Pending Due)</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">Weavers and wholesale shops with highest pending payables</p>
            </div>
            <Link
              to="/parties"
              className="text-xs font-bold text-silk-maroon-800 hover:text-silk-maroon-950 flex items-center gap-1"
            >
              <span>View All Parties</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {data?.topDebtors?.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {data.topDebtors.map((party) => (
                <div key={party.id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50/80 px-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-silk-maroon-50 border border-silk-maroon-100 flex items-center justify-center font-brand font-bold text-silk-maroon-900 text-base shrink-0">
                      {party.name.charAt(0)}
                    </div>
                    <div>
                      <Link to={`/parties/${party.id}`} className="font-bold text-sm text-stone-900 hover:text-silk-maroon-800 transition">
                        {party.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                          {party.marketHub || 'Dharmavaram'}
                        </span>
                        {party.phone && <span>&bull; {party.phone}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-xs text-stone-400 uppercase font-medium">Pending Due</p>
                      <p className="text-sm sm:text-base font-extrabold text-rose-600">
                        {formatINR(party.pendingBalance)}
                      </p>
                    </div>
                    <Link
                      to={`/parties/${party.id}`}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-silk-maroon-800 hover:text-silk-gold-200 text-stone-600 transition"
                      title="Open Chronological Ledger"
                    >
                      <BookOpen className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Scale className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="font-semibold text-stone-700 text-sm">No pending balances</p>
              <p className="text-xs text-stone-400 mt-1">All weaver lots and opening balances are cleared!</p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Manual Vouchers / Repayments */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
            <h2 className="font-brand font-bold text-base text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Recent Payments (Paid)</span>
            </h2>
            <button
              onClick={onOpenPaymentModal}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              + Record
            </button>
          </div>

          {data?.recentTransactions?.length > 0 ? (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
              {data.recentTransactions.map((tx) => {
                const mode = getPaymentModeDetails(tx.paymentMode);
                return (
                  <div key={tx.id} className="p-3 bg-stone-50 hover:bg-stone-100/80 rounded-2xl border border-stone-200/60 transition text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-stone-900">{tx.partyName}</p>
                        <p className="text-stone-500 text-[11px] mt-0.5">{formatDate(tx.transactionDate)}</p>
                      </div>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        + {formatINR(tx.amount)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-1 pt-1.5 border-t border-stone-200/50">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${mode.color}`}>
                        {mode.label}
                      </span>
                      {tx.referenceNumber && (
                        <span className="text-stone-500 truncate max-w-[140px] text-[11px] font-mono">
                          Ref: {tx.referenceNumber}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 my-auto">
              <CreditCard className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-stone-600">No payment vouchers logged yet</p>
            </div>
          )}
        </div>

      </div>

      {/* Recent Lot Invoices Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
          <div>
            <h2 className="font-brand font-bold text-lg text-stone-900">Recent Saree Lot Invoices</h2>
            <p className="text-xs text-stone-500 mt-0.5">Purchased wholesale saree bills and down payment statuses</p>
          </div>
          <Link
            to="/invoices"
            className="text-xs font-bold text-silk-maroon-800 hover:text-silk-maroon-950 flex items-center gap-1"
          >
            <span>View All Lots</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {data?.recentInvoices?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 text-[11px] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Lot / Bill #</th>
                  <th className="pb-3 font-semibold">Weaver / Party</th>
                  <th className="pb-3 font-semibold text-right">Gross Amount</th>
                  <th className="pb-3 font-semibold text-right">Advance Paid</th>
                  <th className="pb-3 font-semibold text-right">Pending Due</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.recentInvoices.map((inv) => {
                  const statusStyle = getStatusStyle(inv.status);
                  return (
                    <tr key={inv.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 text-stone-600 whitespace-nowrap">{formatDate(inv.billDate)}</td>
                      <td className="py-3 font-bold text-stone-900 whitespace-nowrap">
                        #{inv.billNumber}
                        {inv.description && (
                          <span className="block text-[11px] font-normal text-stone-500 truncate max-w-xs">
                            {inv.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-medium text-stone-800">{inv.partyName}</td>
                      <td className="py-3 font-bold text-stone-900 text-right">{formatINR(inv.grossAmount)}</td>
                      <td className="py-3 font-medium text-emerald-700 text-right">{formatINR(inv.advancePaid)}</td>
                      <td className="py-3 font-bold text-rose-700 text-right">{formatINR(inv.balanceDue)}</td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyle.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                          <span>{inv.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-stone-500">No lot bills recorded yet. Tap "+ New Bill Lot" to start your manual Ledger!</p>
          </div>
        )}
      </div>

    </div>
  );
}
