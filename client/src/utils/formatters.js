// Currency & Date formatting utilities for Shivaayaha Silk Sarees

export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹ 0';
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getStatusStyle(status) {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
        dot: 'bg-emerald-500',
        label: 'Fully Paid (Paid)',
      };
    case 'PARTIAL':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-300',
        dot: 'bg-amber-500',
        label: 'Partial (Pending)',
      };
    case 'UNPAID':
    default:
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-300',
        dot: 'bg-rose-500',
        label: 'Unpaid (Due)',
      };
  }
}

export function getPaymentModeDetails(mode) {
  switch (mode) {
    case 'CASH':
      return { label: 'Cash (Cash)', color: 'bg-emerald-100 text-emerald-800' };
    case 'MANUAL_UPI':
      return { label: 'Manual UPI (GPay/PhonePe)', color: 'bg-blue-100 text-blue-800' };
    case 'CHEQUE':
      return { label: 'Cheque', color: 'bg-purple-100 text-purple-800' };
    case 'BANK_TRANSFER':
      return { label: 'Bank IMPS/NEFT', color: 'bg-cyan-100 text-cyan-800' };
    default:
      return { label: mode || 'Manual', color: 'bg-stone-100 text-stone-800' };
  }
}
