import { query, get, run } from '../config/db.js';
import { toPaise, toRupees } from '../utils/currency.js';

// 1. List all parties with current balances for the logged-in user
export function getParties(req, res) {
  try {
    const userId = req.user.id;
    const parties = query(
      `SELECT p.*,
        COALESCE((SELECT SUM(gross_amount) FROM invoices WHERE party_id = p.id), 0) as total_invoiced,
        COALESCE((SELECT SUM(advance_paid) FROM invoices WHERE party_id = p.id), 0) as total_invoice_advance,
        COALESCE((SELECT SUM(balance_due) FROM invoices WHERE party_id = p.id), 0) as total_invoice_balance,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE party_id = p.id AND type = 'CREDIT'), 0) as total_voucher_credit
       FROM parties p
       WHERE p.user_id = ?
       ORDER BY p.name ASC`,
      [userId]
    );

    const formatted = parties.map(p => {
      const openingBal = p.historic_opening_balance || 0;
      // In a supplier/weaver manual ledger:
      // Opening Balance + All Invoices Gross Amount = Total Lot Purchase Value (Debit)
      // Total Advance Paid + Total Subsequent Repayment Vouchers = Total Paid (Credit)
      // Net Outstanding Balance = Total Due - Total Paid
      const totalBills = p.total_invoiced;
      const totalPayments = p.total_invoice_advance + p.total_voucher_credit;
      const currentNetBalance = (openingBal + totalBills) - totalPayments;

      return {
        id: p.id,
        name: p.name,
        phone: p.phone || '',
        marketHub: p.market_hub || '',
        notes: p.notes || '',
        historicOpeningBalance: toRupees(openingBal),
        totalInvoiced: toRupees(totalBills),
        totalPaid: toRupees(totalPayments),
        currentNetBalance: toRupees(currentNetBalance),
        createdAt: p.created_at,
      };
    });

    return res.json({ success: true, parties: formatted });
  } catch (error) {
    console.error('Error fetching parties:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch parties.' });
  }
}

// 2. Add a new party / weaver
export function createParty(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone, marketHub, historicOpeningBalance, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Party/Weaver name is required.' });
    }

    const openingPaise = toPaise(historicOpeningBalance || 0);

    const result = run(
      `INSERT INTO parties (user_id, name, phone, market_hub, historic_opening_balance, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name.trim(), phone ? phone.trim() : '', marketHub ? marketHub.trim() : '', openingPaise, notes || '']
    );

    const newParty = get('SELECT * FROM parties WHERE id = ?', [result.lastInsertRowid]);

    return res.status(201).json({
      success: true,
      message: 'Weaver / Party registered successfully.',
      party: {
        id: newParty.id,
        name: newParty.name,
        phone: newParty.phone,
        marketHub: newParty.market_hub,
        historicOpeningBalance: toRupees(newParty.historic_opening_balance),
        currentNetBalance: toRupees(newParty.historic_opening_balance),
      },
    });
  } catch (error) {
    console.error('Error creating party:', error);
    return res.status(500).json({ success: false, message: 'Failed to create party.' });
  }
}

// 3. Update party
export function updateParty(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, phone, marketHub, historicOpeningBalance, notes } = req.body;

    const existing = get('SELECT id FROM parties WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Party not found.' });
    }

    const openingPaise = toPaise(historicOpeningBalance || 0);

    run(
      `UPDATE parties 
       SET name = ?, phone = ?, market_hub = ?, historic_opening_balance = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [name.trim(), phone || '', marketHub || '', openingPaise, notes || '', id, userId]
    );

    return res.json({ success: true, message: 'Party details updated successfully.' });
  } catch (error) {
    console.error('Error updating party:', error);
    return res.status(500).json({ success: false, message: 'Failed to update party.' });
  }
}

// 4. Delete party
export function deleteParty(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = get('SELECT id FROM parties WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Party not found.' });
    }

    run('DELETE FROM parties WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Party and associated records removed.' });
  } catch (error) {
    console.error('Error deleting party:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete party.' });
  }
}

// 5. Get Chronological Party Ledger with Running Balance
export function getPartyLedger(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const party = get('SELECT * FROM parties WHERE id = ? AND user_id = ?', [id, userId]);
    if (!party) {
      return res.status(404).json({ success: false, message: 'Party not found.' });
    }

    // Fetch all Invoices for this party
    const invoices = query(
      `SELECT id, bill_number, bill_date, description, gross_amount, advance_paid, balance_due, status, created_at
       FROM invoices
       WHERE party_id = ? AND user_id = ?
       ORDER BY bill_date ASC, id ASC`,
      [id, userId]
    );

    // Fetch all Voucher Transactions (Repayments / Manual Payments)
    const transactions = query(
      `SELECT t.*, i.bill_number
       FROM transactions t
       LEFT JOIN invoices i ON t.invoice_id = i.id
       WHERE t.party_id = ? AND t.user_id = ?
       ORDER BY t.transaction_date ASC, t.id ASC`,
      [id, userId]
    );

    // Build unified chronological timeline
    const timeline = [];

    // Historic Opening Balance Line
    if (party.historic_opening_balance !== 0) {
      timeline.push({
        id: 'opening',
        date: party.created_at ? party.created_at.split(' ')[0] : 'Historical',
        type: 'OPENING_BALANCE',
        title: 'Historic Opening Balance',
        description: 'Brought forward from paper Ledger diary',
        debit: party.historic_opening_balance > 0 ? party.historic_opening_balance : 0,
        credit: party.historic_opening_balance < 0 ? Math.abs(party.historic_opening_balance) : 0,
        mode: 'MANUAL',
        ref: 'Diary Ledger',
        timestamp: new Date(party.created_at || '1970-01-01').getTime(),
      });
    }

    // Add Invoices (Debit: Saree Lot Purchase value)
    invoices.forEach(inv => {
      timeline.push({
        id: `inv-${inv.id}`,
        invoiceId: inv.id,
        date: inv.bill_date,
        type: 'INVOICE_BILL',
        title: `Bill Lot #${inv.bill_number}`,
        description: inv.description || 'Saree Lot Purchase',
        debit: inv.gross_amount, // We owe weaver for this lot
        credit: 0,
        mode: 'BILL',
        ref: inv.bill_number,
        status: inv.status,
        timestamp: new Date(inv.bill_date).getTime(),
      });

      // If immediate cash/advance was paid on this bill
      if (inv.advance_paid > 0) {
        timeline.push({
          id: `inv-adv-${inv.id}`,
          invoiceId: inv.id,
          date: inv.bill_date,
          type: 'ADVANCE_PAYMENT',
          title: `Advance on Lot #${inv.bill_number}`,
          description: `Immediate down payment logged with bill #${inv.bill_number}`,
          debit: 0,
          credit: inv.advance_paid, // Money given to weaver
          mode: 'CASH',
          ref: `Adv #${inv.bill_number}`,
          timestamp: new Date(inv.bill_date).getTime() + 1, // slightly after bill
        });
      }
    });

    // Add Subsequent Repayment Vouchers
    transactions.forEach(t => {
      const isCredit = t.type === 'CREDIT';
      timeline.push({
        id: `txn-${t.id}`,
        transactionId: t.id,
        date: t.transaction_date,
        type: 'VOUCHER_PAYMENT',
        title: `Payment Voucher (${t.payment_mode})`,
        description: t.slip_notes || (t.bill_number ? `Payment toward Lot #${t.bill_number}` : 'Ledger Repayment'),
        debit: isCredit ? 0 : t.amount,
        credit: isCredit ? t.amount : 0,
        mode: t.payment_mode,
        ref: t.reference_number || 'N/A',
        timestamp: new Date(t.transaction_date).getTime() + 2,
      });
    });

    // Sort chronologically
    timeline.sort((a, b) => a.timestamp - b.timestamp);

    // Compute Running Balance
    let runningBalancePaise = 0;
    const ledgerRows = timeline.map(row => {
      runningBalancePaise += (row.debit - row.credit);
      return {
        ...row,
        debitFormatted: row.debit ? toRupees(row.debit) : null,
        creditFormatted: row.credit ? toRupees(row.credit) : null,
        runningBalance: toRupees(runningBalancePaise),
      };
    });

    const totalDebitPaise = ledgerRows.reduce((sum, r) => sum + r.debit, 0);
    const totalCreditPaise = ledgerRows.reduce((sum, r) => sum + r.credit, 0);

    return res.json({
      success: true,
      party: {
        id: party.id,
        name: party.name,
        phone: party.phone,
        marketHub: party.market_hub,
        notes: party.notes,
        openingBalance: toRupees(party.historic_opening_balance),
        currentNetBalance: toRupees(runningBalancePaise),
        totalDebit: toRupees(totalDebitPaise),
        totalCredit: toRupees(totalCreditPaise),
      },
      ledger: ledgerRows,
    });
  } catch (error) {
    console.error('Error computing party ledger:', error);
    return res.status(500).json({ success: false, message: 'Failed to compute party ledger.' });
  }
}
