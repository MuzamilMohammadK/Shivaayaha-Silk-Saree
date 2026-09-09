import { query, get } from '../config/db.js';
import { toRupees } from '../utils/currency.js';

export function getDashboardOverview(req, res) {
  try {
    const userId = req.user.id;

    // 1. Total Parties Count
    const partyCountRes = get('SELECT COUNT(*) as count FROM parties WHERE user_id = ?', [userId]);
    const totalParties = partyCountRes ? partyCountRes.count : 0;

    // 2. Total Historic Opening Balances
    const openingBalRes = get(
      'SELECT COALESCE(SUM(historic_opening_balance), 0) as total FROM parties WHERE user_id = ?',
      [userId]
    );
    const totalOpeningPaise = openingBalRes ? openingBalRes.total : 0;

    // 3. Invoices Aggregates
    const invoiceStats = get(
      `SELECT 
        COUNT(*) as total_bills,
        COALESCE(SUM(gross_amount), 0) as total_gross,
        COALESCE(SUM(advance_paid), 0) as total_advance,
        COALESCE(SUM(balance_due), 0) as total_balance_due
       FROM invoices
       WHERE user_id = ?`,
      [userId]
    );

    const totalBills = invoiceStats ? invoiceStats.total_bills : 0;
    const totalGrossPaise = invoiceStats ? invoiceStats.total_gross : 0;
    const totalAdvancePaise = invoiceStats ? invoiceStats.total_advance : 0;

    // 4. Voucher Payments (Subsequent repayments)
    const voucherStats = get(
      `SELECT COALESCE(SUM(amount), 0) as total_vouchers
       FROM transactions
       WHERE user_id = ? AND type = 'CREDIT'`,
      [userId]
    );
    const totalVoucherPaise = voucherStats ? voucherStats.total_vouchers : 0;

    // Total Paid / Disbursed (Paid) = Advance + Repayment Vouchers
    const totalPaidPaise = totalAdvancePaise + totalVoucherPaise;

    // Total Bill Value = Gross Amount of all lots
    // Total Outstanding Balance (Due) = (Opening Balances + Gross Amount) - Total Paid
    const totalOutstandingPaise = (totalOpeningPaise + totalGrossPaise) - totalPaidPaise;

    // 5. Recent 6 Transactions / Vouchers
    const recentTransactions = query(
      `SELECT t.*, p.name as party_name, p.market_hub, i.bill_number
       FROM transactions t
       JOIN parties p ON t.party_id = p.id
       LEFT JOIN invoices i ON t.invoice_id = i.id
       WHERE t.user_id = ?
       ORDER BY t.transaction_date DESC, t.id DESC
       LIMIT 6`,
      [userId]
    ).map(t => ({
      id: t.id,
      partyName: t.party_name,
      marketHub: t.market_hub,
      billNumber: t.bill_number,
      amount: toRupees(t.amount),
      paymentMode: t.payment_mode,
      referenceNumber: t.reference_number,
      slipNotes: t.slip_notes,
      transactionDate: t.transaction_date,
    }));

    // 6. Recent 6 Invoices / Lots
    const recentInvoices = query(
      `SELECT i.*, p.name as party_name, p.market_hub
       FROM invoices i
       JOIN parties p ON i.party_id = p.id
       WHERE i.user_id = ?
       ORDER BY i.bill_date DESC, i.id DESC
       LIMIT 6`,
      [userId]
    ).map(i => ({
      id: i.id,
      partyName: i.party_name,
      marketHub: i.market_hub,
      billNumber: i.bill_number,
      billDate: i.bill_date,
      description: i.description,
      grossAmount: toRupees(i.gross_amount),
      advancePaid: toRupees(i.advance_paid),
      balanceDue: toRupees(i.balance_due),
      status: i.status,
    }));

    // 7. Top Parties with Pending Balances (Due)
    const topDebtors = query(
      `SELECT p.id, p.name, p.phone, p.market_hub, p.historic_opening_balance,
        COALESCE((SELECT SUM(gross_amount) FROM invoices WHERE party_id = p.id), 0) as total_invoiced,
        COALESCE((SELECT SUM(advance_paid) FROM invoices WHERE party_id = p.id), 0) as total_advance,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE party_id = p.id AND type = 'CREDIT'), 0) as total_voucher_credit
       FROM parties p
       WHERE p.user_id = ?
       LIMIT 10`,
      [userId]
    ).map(p => {
      const netPaise = (p.historic_opening_balance + p.total_invoiced) - (p.total_advance + p.total_voucher_credit);
      return {
        id: p.id,
        name: p.name,
        phone: p.phone,
        marketHub: p.market_hub,
        pendingBalance: toRupees(netPaise),
      };
    }).filter(p => p.pendingBalance > 0).sort((a, b) => b.pendingBalance - a.pendingBalance);

    // 8. Payment Modes Breakdown
    const paymentModes = query(
      `SELECT payment_mode, COUNT(*) as count, COALESCE(SUM(amount), 0) as total_paise
       FROM transactions
       WHERE user_id = ? AND type = 'CREDIT'
       GROUP BY payment_mode`,
      [userId]
    ).map(m => ({
      mode: m.payment_mode,
      count: m.count,
      amount: toRupees(m.total_paise),
    }));

    // 9. Monthly Trends (Last 6 Months)
    const monthlyInvoices = query(
      `SELECT strftime('%Y-%m', bill_date) as month, COALESCE(SUM(gross_amount), 0) as billed_paise
       FROM invoices
       WHERE user_id = ?
       GROUP BY month
       ORDER BY month DESC
       LIMIT 6`,
      [userId]
    );

    const monthlyPayments = query(
      `SELECT strftime('%Y-%m', transaction_date) as month, COALESCE(SUM(amount), 0) as paid_paise
       FROM transactions
       WHERE user_id = ? AND type = 'CREDIT'
       GROUP BY month
       ORDER BY month DESC
       LIMIT 6`,
      [userId]
    );

    // Merge months
    const allMonths = Array.from(new Set([
      ...monthlyInvoices.map(i => i.month),
      ...monthlyPayments.map(p => p.month),
    ])).filter(Boolean).sort();

    const monthlyTrends = allMonths.map(month => {
      const inv = monthlyInvoices.find(i => i.month === month);
      const pay = monthlyPayments.find(p => p.month === month);
      return {
        month,
        billed: inv ? toRupees(inv.billed_paise) : 0,
        paid: pay ? toRupees(pay.paid_paise) : 0,
      };
    });

    return res.json({
      success: true,
      stats: {
        totalParties,
        totalBills,
        totalBillValue: toRupees(totalGrossPaise),
        totalPaidJama: toRupees(totalPaidPaise),
        totalOutstandingBaki: toRupees(totalOutstandingPaise),
        totalOpeningBalance: toRupees(totalOpeningPaise),
      },
      paymentModes,
      monthlyTrends,
      recentTransactions,
      recentInvoices,
      topDebtors,
    });
  } catch (error) {
    console.error('Error in dashboard overview:', error);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard overview.' });
  }
}
