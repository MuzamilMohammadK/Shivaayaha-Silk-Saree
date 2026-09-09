import React, { useState } from 'react';
import { formatINR } from '../utils/formatters';
import { TrendingUp, BarChart3, Wallet, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const MODE_META = {
  CASH:          { label: 'Cash',       color: '#10B981', bg: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  MANUAL_UPI:    { label: 'UPI',        color: '#3B82F6', bg: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-800 border-blue-200' },
  CHEQUE:        { label: 'Cheque',     color: '#F59E0B', bg: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-800 border-amber-200' },
  BANK_TRANSFER: { label: 'IMPS/NEFT', color: '#8B5CF6', bg: 'bg-purple-500',  badge: 'bg-purple-50 text-purple-800 border-purple-200' },
};

function getMeta(mode) {
  return MODE_META[mode] || { label: mode, color: '#78716C', bg: 'bg-stone-500', badge: 'bg-stone-50 text-stone-700 border-stone-200' };
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ paidPercent }) {
  const radius = 52;
  const stroke = 14;
  const circ   = 2 * Math.PI * radius;
  const pct    = clamp(paidPercent, 0, 100);
  const offset = circ - (pct / 100) * circ;

  return (
    <svg viewBox="0 0 130 130" className="w-full h-full" aria-label={`${pct}% settled`}>
      <defs>
        <linearGradient id="paidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="dueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#FECACA" />
          <stop offset="100%" stopColor="#FCA5A5" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle cx="65" cy="65" r={radius} fill="none" stroke="url(#dueGrad)" strokeWidth={stroke} />
      {/* Paid arc */}
      <circle
        cx="65" cy="65" r={radius}
        fill="none"
        stroke="url(#paidGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 65 65)"
        filter="url(#glow)"
        className="transition-all duration-1000 ease-out"
      />
      {/* Center text */}
      <text x="65" y="58" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1C1917" fontFamily="system-ui">
        {pct}%
      </text>
      <text x="65" y="74" textAnchor="middle" fontSize="9" fontWeight="700" fill="#059669" letterSpacing="1.5" fontFamily="system-ui">
        SETTLED
      </text>
    </svg>
  );
}

// ─── Bar ─────────────────────────────────────────────────────────────────────
function Bar({ widthPct, color, className = '' }) {
  return (
    <div className={`w-full h-2 bg-stone-100 rounded-full overflow-hidden ${className}`}>
      <div
        style={{ width: `${clamp(widthPct, 4, 100)}%`, background: color }}
        className="h-full rounded-full transition-all duration-700 ease-out"
      />
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'settlement', label: 'Settlement', icon: TrendingUp },
  { id: 'weavers',    label: 'Weavers',    icon: BarChart3 },
  { id: 'modes',      label: 'Modes',      icon: Wallet },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardChart({ stats = {}, topDebtors = [], paymentModes = [] }) {
  const [tab, setTab] = useState('settlement');

  const totalBillValue = stats.totalBillValue || 0;
  const totalPaid      = stats.totalPaidJama  || 0;
  const totalDue       = Math.max(0, stats.totalOutstandingBaki || 0); // never negative
  const grandTotal     = totalPaid + totalDue;
  const paidPercent    = grandTotal > 0 ? Math.round((totalPaid / grandTotal) * 100) : 0;
  const duePercent     = 100 - clamp(paidPercent, 0, 100);

  const maxDebtor = topDebtors.length ? Math.max(...topDebtors.slice(0,5).map(d => d.pendingBalance), 1) : 1;
  const totalMode = paymentModes.reduce((s, m) => s + (m.amount || 0), 0);

  const DEBTOR_COLORS = ['#B45309', '#DC2626', '#7C3AED', '#0F766E', '#1D4ED8'];

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-stone-100">
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
          {/* Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-silk-maroon-50 border border-silk-maroon-100 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-silk-maroon-800" />
            </div>
            <div>
              <h2 className="font-brand font-bold text-sm text-stone-900 leading-tight whitespace-nowrap">
                Ledger Analytics
              </h2>
              <p className="text-[10px] text-stone-400">Live financial overview</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center bg-stone-100 rounded-xl p-1 gap-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  tab === id
                    ? 'bg-white text-silk-maroon-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex-1 px-5 py-5">

        {/* Settlement Tab */}
        {tab === 'settlement' && (
          <div className="flex flex-col gap-5">
            {/* Donut + summary side by side on wider panels */}
            <div className="flex items-center gap-5">
              {/* Donut */}
              <div className="w-32 h-32 shrink-0">
                <DonutChart paidPercent={paidPercent} />
              </div>

              {/* Stats column */}
              <div className="flex flex-col gap-3 flex-1 min-w-0">
                {/* Settled */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Settled (Paid)</p>
                    <p className="text-base font-extrabold text-emerald-900 truncate">{formatINR(totalPaid)}</p>
                  </div>
                </div>
                {/* Pending */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-100">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wide">Pending (Due)</p>
                    <p className="text-base font-extrabold text-rose-900 truncate">{formatINR(totalDue)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 mb-1.5">
                <span className="text-emerald-700">Paid {paidPercent}%</span>
                <span className="text-rose-600">Due {duePercent}%</span>
              </div>
              <div className="w-full h-3 bg-rose-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${clamp(paidPercent, 0, 100)}%` }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Weavers Tab */}
        {tab === 'weavers' && (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold text-stone-500">Top weavers by outstanding due:</p>
            {topDebtors.slice(0, 5).length > 0 ? (
              <div className="space-y-3.5">
                {topDebtors.slice(0, 5).map((d, i) => (
                  <div key={d.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0"
                          style={{ background: DEBTOR_COLORS[i] || '#78716C' }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-xs font-bold text-stone-800 truncate">{d.name}</span>
                      </div>
                      <span className="text-xs font-extrabold text-rose-600 shrink-0 ml-2">
                        {formatINR(d.pendingBalance)}
                      </span>
                    </div>
                    <Bar
                      widthPct={Math.round((d.pendingBalance / maxDebtor) * 100)}
                      color={DEBTOR_COLORS[i] || '#78716C'}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-stone-400 gap-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-300" />
                <p className="text-xs font-medium text-stone-500">All weavers are fully settled!</p>
              </div>
            )}
          </div>
        )}

        {/* Modes Tab */}
        {tab === 'modes' && (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold text-stone-500">Payment disbursement by method:</p>
            {paymentModes.length > 0 ? (
              <div className="space-y-3.5">
                {paymentModes.map((item) => {
                  const meta   = getMeta(item.mode);
                  const pct    = totalMode > 0 ? Math.round((item.amount / totalMode) * 100) : 0;
                  return (
                    <div key={item.mode}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.badge} shrink-0`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {item.count} {item.count === 1 ? 'voucher' : 'vouchers'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-semibold text-stone-500">{pct}%</span>
                          <span className="text-xs font-extrabold text-stone-800">{formatINR(item.amount)}</span>
                        </div>
                      </div>
                      <Bar widthPct={pct} color={meta.color} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-stone-400 gap-2">
                <Wallet className="w-10 h-10 text-stone-300" />
                <p className="text-xs font-medium text-stone-500">No payment vouchers logged yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between">
        <span className="text-[11px] text-stone-400 font-medium">Total Turnover</span>
        <span className="text-sm font-extrabold text-stone-800">{formatINR(totalBillValue)}</span>
      </div>
    </div>
  );
}
