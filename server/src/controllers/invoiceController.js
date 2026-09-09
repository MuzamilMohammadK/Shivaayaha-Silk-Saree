import { query, get, run, transaction } from '../config/db.js';
import { toPaise, toRupees } from '../utils/currency.js';

// 1. List all Invoices for the authenticated user
export function getInvoices(req, res) {
  try {
    const userId = req.user.id;
    const { partyId, status } = req.query;

    let sql = `
      SELECT i.*, p.name as party_name, p.market_hub,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE invoice_id = i.id AND type = 'CREDIT'), 0) as additional_payments
      FROM invoices i
      JOIN parties p ON i.party_id = p.id
      WHERE i.user_id = ?
    `;
    const params = [userId];

    if (partyId) {
      sql += ' AND i.party_id = ?';
      params.push(partyId);
    }

    if (status) {
      sql += ' AND i.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY i.bill_date DESC, i.id DESC';

    const invoices = query(sql, params);

    const formatted = invoices.map(inv => {
      const grossPaise = inv.gross_amount;
      const advancePaise = inv.advance_paid;
      const additionalPaise = inv.additional_payments || 0;
      const totalPaidPaise = advancePaise + additionalPaise;
      const balanceDuePaise = Math.max(0, grossPaise - totalPaidPaise);

      let currentStatus = inv.status;
      if (totalPaidPaise >= grossPaise) {
        currentStatus = 'PAID';
      } else if (totalPaidPaise > 0) {
        currentStatus = 'PARTIAL';
      } else {
        currentStatus = 'UNPAID';
      }

      return {
        id: inv.id,
        partyId: inv.party_id,
        partyName: inv.party_name,
        marketHub: inv.market_hub,
        billNumber: inv.bill_number,
        billDate: inv.bill_date,
        description: inv.description,
        grossAmount: toRupees(grossPaise),
        advancePaid: toRupees(advancePaise),
        additionalPayments: toRupees(additionalPaise),
        totalPaid: toRupees(totalPaidPaise),
        balanceDue: toRupees(balanceDuePaise),
        status: currentStatus,
        createdAt: inv.created_at,
      };
    });

    return res.json({ success: true, invoices: formatted });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch bills.' });
  }
}

// 2. Create a Manual Invoice / Purchase Bill Entry
export function createInvoice(req, res) {
  try {
    const userId = req.user.id;
    const { partyId, billNumber, billDate, description, grossAmount, advancePaid } = req.body;

    if (!partyId || !billNumber || !billDate || grossAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Party, Bill number, Date, and Gross Amount are required.',
      });
    }

    // Verify party exists
    const party = get('SELECT id, name FROM parties WHERE id = ? AND user_id = ?', [partyId, userId]);
    if (!party) {
      return res.status(404).json({ success: false, message: 'Party not found.' });
    }

    const grossPaise = toPaise(grossAmount);
    const advancePaise = toPaise(advancePaid || 0);

    if (grossPaise <= 0) {
      return res.status(400).json({ success: false, message: 'Gross amount must be greater than zero.' });
    }

    if (advancePaise > grossPaise) {
      return res.status(400).json({ success: false, message: 'Advance paid cannot exceed the gross bill amount.' });
    }

    const balanceDuePaise = grossPaise - advancePaise;

    let status = 'UNPAID';
    if (balanceDuePaise === 0) {
      status = 'PAID';
    } else if (advancePaise > 0) {
      status = 'PARTIAL';
    }

    const result = run(
      `INSERT INTO invoices (user_id, party_id, bill_number, bill_date, description, gross_amount, advance_paid, balance_due, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        partyId,
        billNumber.trim(),
        billDate,
        description ? description.trim() : '',
        grossPaise,
        advancePaise,
        balanceDuePaise,
        status,
      ]
    );

    return res.status(201).json({
      success: true,
      message: `Bill Lot #${billNumber} recorded successfully.`,
      invoice: {
        id: result.lastInsertRowid,
        partyId,
        partyName: party.name,
        billNumber: billNumber.trim(),
        billDate,
        description: description || '',
        grossAmount: toRupees(grossPaise),
        advancePaid: toRupees(advancePaise),
        balanceDue: toRupees(balanceDuePaise),
        status,
      },
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({ success: false, message: 'Failed to record manual bill.' });
  }
}

// 3. Delete an invoice
export function deleteInvoice(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = get('SELECT id FROM invoices WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }

    run('DELETE FROM invoices WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Bill removed successfully.' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete bill.' });
  }
}
