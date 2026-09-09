import React from 'react';
import { formatINR } from '../utils/formatters';

export default function StatCard({ title, amount, subtitle, icon: Icon, variant = 'default', badgeText }) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'maroon':
        return {
          card: 'bg-gradient-to-br from-silk-maroon-900 via-silk-maroon-950 to-stone-950 text-white border-silk-gold-500/40',
          iconBg: 'bg-silk-maroon-800 text-silk-gold-300 border border-silk-gold-500/30',
          valueText: 'text-silk-gold-200',
          badge: 'bg-silk-gold-500/20 text-silk-gold-300 border-silk-gold-500/40',
        };
      case 'emerald':
        return {
          card: 'bg-white text-stone-900 border-emerald-200 hover:border-emerald-300 shadow-sm',
          iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
          valueText: 'text-emerald-700',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'rose':
        return {
          card: 'bg-white text-stone-900 border-rose-200 hover:border-rose-300 shadow-sm',
          iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
          valueText: 'text-rose-700',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      default:
        return {
          card: 'bg-white text-stone-900 border-stone-200 shadow-sm',
          iconBg: 'bg-stone-50 text-stone-600 border border-stone-100',
          valueText: 'text-stone-900',
          badge: 'bg-stone-100 text-stone-700 border-stone-200',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`rounded-2xl p-5 border transition-all hover:shadow-md ${styles.card}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">{title}</p>
          <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${styles.valueText}`}>
            {formatINR(amount)}
          </p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl shrink-0 ${styles.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between pt-2 border-t border-stone-200/40 dark:border-stone-800">
        <span className="text-xs text-stone-400">{subtitle}</span>
        {badgeText && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${styles.badge}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
