import React, { useState } from 'react';
import { formatINR } from '../utils/formatters';
import { PieChart, BarChart3, Wallet, TrendingUp, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DashboardChart({ stats, topDebtors = [], paymentModes = [], monthlyTrends = [] }) {
  const [activeTab, setActiveTab] = useState('settlement'); // 'settlement' | 'weavers' | 'modes'

  const totalBillValue = stats?.totalBillValue || 0;
  const totalPaid = stats?.totalPaidJama || 0;
  const totalDue = stats?.totalOutstandingBaki || 0;

  // Calculate settlement percentages
  const grandTotal = totalPaid + totalDue;
  const paidPercent = grandTotal > 0 ? Math.round((totalPaid / grandTotal) * 100) : 0;
  const duePercent = grandTotal > 0 ? 100 - paidPercent : 0;

  // Circumference for Donut Chart (radius = 54)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const paidDashOffset = circumference - (paidPercent / 100) * circumference;

  // Max debtor balance for bar graph scaling
  const maxDebtorBalance = topDebtors.length > 0 
    ? Math.max(...topDebtors.slice(0, 5).map(d => d.pendingBalance), 1)
    : 1;

  // Total payment modes volume
  const totalModesAmount = paymentModes.reduce((acc, m) => acc + (m.amount || 0), 0);

  const getModeColor = (mode) => {
    switch (mode) {
      case 'CASH': return { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', fill: '#10B981', label: 'Cash' };
      case 'MANUAL_UPI': return { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', fill: '#3B82F6', label: 'Manual UPI' };
      case 'CHEQUE': return { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', fill: '#F59E0B', label: 'Cheque' };
      case 'BANK_TRANSFER': return { bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-200', fill: '#8B5CF6', label: 'IMPS/NEFT' };
      default: return { bg: 'bg-stone-500', text: 'text-stone-700', border: 'border-stone-200', fill: '#78716C', label: mode };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col justify-between h-full">
      {/* Header & Tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h2 className="font-brand font-bold text-base text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-silk-maroon-800" />
              <span>Ledger Analytics Graph</span>
            </h2>
            <p className="text-[11px] text-stone-500 mt-0.5">Visual breakdown of payments, pending dues & weavers</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('settlement')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                activeTab === 'settlement'
                  ? 'bg-white text-silk-maroon-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Settlement Ratio"
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Settlement</span>
            </button>

            <button
              onClick={() => setActiveTab('weavers')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                activeTab === 'weavers'
                  ? 'bg-white text-silk-maroon-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Top Weaver Balances"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Weavers</span>
            </button>

            <button
              onClick={() => setActiveTab('modes')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                activeTab === 'modes'
                  ? 'bg-white text-silk-maroon-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Payment Modes"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Modes</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Settlement Ratio (Donut Chart) */}
        {activeTab === 'settlement' && (
          <div className="pt-4">
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* SVG Donut */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                  {/* Background Track (Due / Rose) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    className="stroke-rose-100"
                    strokeWidth="16"
                    fill="transparent"
                  />
                  {/* Paid Segment (Emerald) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="url(#emeraldGradient)"
                    strokeWidth="16"
                    strokeDasharray={circumference}
                    strokeDashoffset={paidDashOffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center Content */}
                <div className="absolute text-center flex flex-col items-center">
                  <span className="text-2xl font-black text-stone-900">{paidPercent}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                    Settled
                  </span>
                </div>
              </div>

              {/* Progress Summary Bar */}
              <div className="w-full mt-4 space-y-2">
                <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${paidPercent}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-700"
                    title={`Paid: ${paidPercent}%`}
                  ></div>
                  <div
                    style={{ width: `${duePercent}%` }}
                    className="h-full bg-rose-500 transition-all duration-700"
                    title={`Due: ${duePercent}%`}
                  ></div>
                </div>

                {/* Legend & Numbers */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-semibold text-emerald-800 uppercase">Settled (Paid)</p>
                      <p className="text-xs sm:text-sm font-extrabold text-emerald-950 truncate">{formatINR(totalPaid)}</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-100 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0"></div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-semibold text-rose-800 uppercase">Pending (Due)</p>
                      <p className="text-xs sm:text-sm font-extrabold text-rose-950 truncate">{formatINR(totalDue)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Top Weaver Balances (Horizontal Bar Graph) */}
        {activeTab === 'weavers' && (
          <div className="pt-4 space-y-3.5">
            <p className="text-xs text-stone-500 font-medium">
              Top 5 Weavers by Outstanding Due:
            </p>

            {topDebtors.slice(0, 5).length > 0 ? (
              <div className="space-y-3">
                {topDebtors.slice(0, 5).map((debtor, index) => {
                  const widthPercent = Math.max(8, Math.round((debtor.pendingBalance / maxDebtorBalance) * 100));
                  return (
                    <div key={debtor.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-800 truncate max-w-[150px]">
                          {index + 1}. {debtor.name}
                        </span>
                        <span className="font-extrabold text-rose-600">
                          {formatINR(debtor.pendingBalance)}
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${widthPercent}%` }}
                          className="h-full bg-gradient-to-r from-silk-gold-500 via-rose-400 to-rose-500 rounded-full transition-all duration-700"
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-400 text-xs">
                No outstanding weaver dues to display.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Payment Modes Breakdown */}
        {activeTab === 'modes' && (
          <div className="pt-4 space-y-3">
            <p className="text-xs text-stone-500 font-medium">
              Vouchers & Advances by Payment Type:
            </p>

            {paymentModes.length > 0 ? (
              <div className="space-y-3">
                {paymentModes.map((item) => {
                  const modeInfo = getModeColor(item.mode);
                  const modePercent = totalModesAmount > 0 
                    ? Math.round((item.amount / totalModesAmount) * 100) 
                    : 0;

                  return (
                    <div key={item.mode} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${modeInfo.bg}`}></span>
                          <span className="font-bold text-stone-800">{modeInfo.label}</span>
                          <span className="text-[10px] text-stone-400">({item.count} {item.count === 1 ? 'voucher' : 'vouchers'})</span>
                        </div>
                        <span className="font-extrabold text-stone-900">{formatINR(item.amount)}</span>
                      </div>

                      <div className="w-full h-2 bg-stone-200/80 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(5, modePercent)}%` }}
                          className={`h-full ${modeInfo.bg} rounded-full transition-all duration-500`}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-400 text-xs">
                No payment mode vouchers logged yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
        <span>Turnover Volume:</span>
        <span className="font-bold text-stone-800">{formatINR(totalBillValue)}</span>
      </div>
    </div>
  );
}
