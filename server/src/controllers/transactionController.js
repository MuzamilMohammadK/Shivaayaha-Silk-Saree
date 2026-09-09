import { query, get, run, transaction } from '../config/db.js';
import { toPaise, toRupees } from '../utils/currency.js';

// 1. List transactions
export function getTransactions(req, res) {
  try {
    const userId = req.user.id;
    const { partyId, limit = 50 } = req.query;

    let sql = `
      SELECT t.*, p.name as party_name, p.market_hub, i.bill_number
      FROM transactions t
      JOIN parties p ON t.party_id = p.id
      LEFT JOIN invoices i ON t.invoice_id = i.id
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (partyId) {
      sql += ' AND t.party_id = ?';
      params.push(partyId);
    }

    sql += ' ORDER BY t.transaction_date DESC, t.id DESC LIMIT ?';
    params.push(Number(limit));

    const transactions = query(sql, params);

    const formatted = transactions.map(t => ({
      id: t.id,
      partyId: t.party_id,
      partyName: t.party_name,
      marketHub: t.market_hub,
      invoiceId: t.invoice_id,
      billNumber: t.bill_number,
      type: t.type, // 'CREDIT' (Payment to weaver) or 'DEBIT' (Due)
      amount: toRupees(t.amount),
      paymentMode: t.payment_mode, // 'CASH', 'MANUAL_UPI', 'CHEQUE', 'BANK_TRANSFER'
      referenceNumber: t.reference_number || '',
      slipNotes: t.slip_notes || '',
      transactionDate: t.transaction_date,
      createdAt: t.created_at,
    }));

    return res.json({ success: true, transactions: formatted });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
  }
}

// 2. Record a Manual Voucher / Repayment with Atomic Transaction
export function createTransaction(req, res) {
  try {
    const userId = req.user.id;
    const {
      partyId,
      invoiceId,
      type = 'CREDIT', // Default to CREDIT (Payment to weaver)
      amount,
      paymentMode,
      referenceNumber,
      slipNotes,
      transactionDate,
    } = req.body;

    if (!partyId || !amount || !paymentMode || !transactionDate) {
      return res.status(400).json({
        success: false,
        message: 'Party, amount, payment mode, and transaction date are required.',
      });
    }

    const validModes = ['CASH', 'MANUAL_UPI', 'CHEQUE', 'BANK_TRANSFER'];
    if (!validModes.includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment mode. Must be one of: ${validModes.join(', ')}`,
      });
    }

    const amountPaise = toPaise(amount);
    if (amountPaise <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    }

    // Check party ownership
    const party = get('SELECT id, name FROM parties WHERE id = ? AND user_id = ?', [partyId, userId]);
    if (!party) {
      return res.status(404).json({ success: false, message: 'Party not found.' });
    }

    // Atomic execution
    const newTxId = transaction(() => {
      // 1. If linked to an invoice, update the invoice's balance_due and status
      if (invoiceId) {
        const invoice = get(
          'SELECT id, gross_amount, advance_paid, balance_due FROM invoices WHERE id = ? AND party_id = ? AND user_id = ?',
          [invoiceId, partyId, userId]
        );

        if (!invoice) {
          throw new Error('Selected bill invoice not found for this party.');
        }

        // Calculate all previous credits for this invoice
        const prevCredits = get(
          "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE invoice_id = ? AND type = 'CREDIT'",
          [invoiceId]
        );
        const totalPaidSoFar = invoice.advance_paid + (prevCredits ? prevCredits.total : 0);
        const newTotalPaid = totalPaidSoFar + amountPaise;
        const newBalanceDue = Math.max(0, invoice.gross_amount - newTotalPaid);

        let newStatus = 'PARTIAL';
        if (newBalanceDue === 0) {
          newStatus = 'PAID';
        }

        run('UPDATE invoices SET balance_due = ?, status = ? WHERE id = ?', [
          newBalanceDue,
          newStatus,
          invoiceId,
        ]);
      }

      // 2. Insert the transaction entry
      const insertResult = run(
        `INSERT INTO transactions 
          (user_id, party_id, invoice_id, type, amount, payment_mode, reference_number, slip_notes, transaction_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          partyId,
          invoiceId || null,
          type,
          amountPaise,
          paymentMode,
          referenceNumber ? referenceNumber.trim() : '',
          slipNotes ? slipNotes.trim() : '',
          transactionDate,
        ]
      );

      return insertResult.lastInsertRowid;
    });

    return res.status(201).json({
      success: true,
      message: `Manual voucher of ₹${amount} logged successfully.`,
      transactionId: newTxId,
    });
  } catch (error) {
    console.error('Error recording transaction:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to record manual voucher.' });
  }
}

// 3. Delete a transaction
export function deleteTransaction(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = get('SELECT id, invoice_id, party_id, amount, type FROM transactions WHERE id = ? AND user_id = ?', [
      id,
      userId,
    ]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transaction voucher not found.' });
    }

    transaction(() => {
      // If was linked to an invoice, recalculate invoice balance
      if (existing.invoice_id) {
        const invoice = get('SELECT id, gross_amount, advance_paid FROM invoices WHERE id = ?', [existing.invoice_id]);
        if (invoice) {
          const remainingCredits = get(
            "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE invoice_id = ? AND type = 'CREDIT' AND id != ?",
            [existing.invoice_id, id]
          );
          const totalPaid = invoice.advance_paid + (remainingCredits ? remainingCredits.total : 0);
          const newBalanceDue = Math.max(0, invoice.gross_amount - totalPaid);
          let newStatus = 'UNPAID';
          if (newBalanceDue === 0) {
            newStatus = 'PAID';
          } else if (totalPaid > 0) {
            newStatus = 'PARTIAL';
          }
          run('UPDATE invoices SET balance_due = ?, status = ? WHERE id = ?', [
            newBalanceDue,
            newStatus,
            existing.invoice_id,
          ]);
        }
      }

      run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
    });

    return res.json({ success: true, message: 'Voucher transaction deleted.' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete transaction.' });
  }
}
