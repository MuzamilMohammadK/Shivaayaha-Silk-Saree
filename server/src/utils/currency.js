/**
 * Currency utility for exact manual ledger calculations without floating-point math issues.
 * Storing all monetary amounts in paise (1 INR = 100 paise) guarantees 100% exact precision.
 */

// Convert INR (number or string like "150000" or "70000.50") to exact integer paise
export function toPaise(inr) {
  if (inr === null || inr === undefined || inr === '') return 0;
  const cleaned = String(inr).replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

// Convert paise back to numeric INR float (e.g. 15000000 -> 150000)
export function toRupees(paise) {
  if (paise === null || paise === undefined) return 0;
  return Number((paise / 100).toFixed(2));
}

// Format paise directly to Indian Rupee string with symbol ₹ and standard commas
export function formatINR(paise) {
  const rupees = toRupees(paise);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2
  }).format(rupees);
}
