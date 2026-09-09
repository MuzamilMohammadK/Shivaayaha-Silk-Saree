import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { transactionService } from '../services/transactionService';
import { invoiceService } from '../services/invoiceService';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatters';
import { CreditCard, Hash, FileEdit, UserCheck } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, parties = [], onSaved, preselectedPartyId = null, preselectedInvoiceId = null }) {
  const { showToast } = useToast();
  const [partyId, setPartyId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [partyInvoices, setPartyInvoices] = useState([]);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [slipNotes, setSlipNotes] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (preselectedPartyId) {
        setPartyId(preselectedPartyId);
      } else if (parties.length > 0 && !partyId) {
        setPartyId(parties[0].id);
      }
      if (preselectedInvoiceId) {
        setInvoiceId(preselectedInvoiceId);
      }
    }
  }, [isOpen, preselectedPartyId, preselectedInvoiceId, parties]);

  // Load unpaid or partial invoices for this party when partyId changes
  useEffect(() => {
    if (partyId) {
      invoiceService.getInvoices({ partyId })
        .then((res) => {
          if (res.success) {
            setPartyInvoices(res.invoices.filter((inv) => inv.balanceDue > 0));
          }
        })
        .catch(console.error);
    } else {
      setPartyInvoices([]);
    }
  }, [partyId]);

  const selectedParty = parties.find((p) => String(p.id) === String(partyId));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!partyId) {
      showToast('Please select a weaver or supplier party.', 'error');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      showToast('Please enter a valid payment amount greater than zero.', 'error');
      return;
    }

    try {
      setLoading(true);
      await transactionService.createTransaction({
        partyId: Number(partyId),
        invoiceId: invoiceId ? Number(invoiceId) : null,
        type: 'CREDIT', // Repayment to weaver / Paid
        amount: amountNum,
        paymentMode,
        referenceNumber: referenceNumber.trim(),
        slipNotes: slipNotes.trim(),
        transactionDate,
      });

      showToast(`Manual voucher of ${formatINR(amountNum)} recorded in Ledger!`, 'success');
      setAmount('');
      setReferenceNumber('');
      setSlipNotes('');
      setInvoiceId('');
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Failed to record manual voucher.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Manual Payment (Paid)"
      subtitle="Manual cash voucher, typed UPI UTR, or cheque settlement"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Weaver / Party Selection */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Weaver / Wholesale Party <span className="text-rose-500">*</span>
          </label>
          <select
            value={partyId}
            onChange={(e) => {
              setPartyId(e.target.value);
              setInvoiceId('');
            }}
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition"
            required
          >
            <option value="">-- Select Weaver / Party --</option>
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.marketHub ? `(${p.marketHub})` : ''} - Net Due: {formatINR(p.currentNetBalance)}
              </option>
            ))}
          </select>

          {selectedParty && (
            <div className="mt-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
              <span className="text-amber-800">Current Pending Due:</span>
              <span className="font-bold text-amber-900 text-sm">{formatINR(selectedParty.currentNetBalance)}</span>
            </div>
          )}
        </div>

        {/* Optional Link to Specific Bill / Lot */}
        {partyInvoices.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Link To Specific Bill / Lot (Optional)
            </label>
            <select
              value={invoiceId}
              onChange={(e) => {
                setInvoiceId(e.target.value);
                const inv = partyInvoices.find((i) => String(i.id) === e.target.value);
                if (inv && !amount) {
                  setAmount(inv.balanceDue);
                }
              }}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 outline-none transition"
            >
              <option value="">-- General Account Balance (No single bill) --</option>
              {partyInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  Lot #{inv.billNumber} ({inv.billDate}) - Due: {formatINR(inv.balanceDue)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Amount and Payment Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
              Payment Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-stone-500 font-bold text-base">₹</span>
              <input
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25000"
                className="w-full pl-8 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold text-base focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Payment Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 outline-none transition"
              required
            />
          </div>
        </div>

        {/* Payment Mode Selection */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Payment Mode <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'CASH', label: 'Cash (Cash)' },
              { id: 'MANUAL_UPI', label: 'Manual UPI' },
              { id: 'CHEQUE', label: 'Cheque' },
              { id: 'BANK_TRANSFER', label: 'IMPS/NEFT' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setPaymentMode(mode.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition ${
                  paymentMode === mode.id
                    ? 'bg-silk-maroon-800 text-silk-gold-200 border-silk-gold-500 shadow-sm'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Reference (Hand-typed UPI UTR, Diary voucher, Cheque #) */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Manual Ref / UTR / Cheque / Diary Voucher No.
          </label>
          <div className="relative">
            <Hash className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g., UTR: 423985109283 or Voucher #82 or Chq #000412"
              className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition"
            />
          </div>
        </div>

        {/* Memo / Rough Paper Slip Details */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Paper Slip Memo / Notes (Optional)
          </label>
          <div className="relative">
            <FileEdit className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={slipNotes}
              onChange={(e) => setSlipNotes(e.target.value)}
              placeholder="e.g., Handed over cash at Dharmavaram shop"
              className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 outline-none transition"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-stone-700 hover:bg-stone-100 text-sm font-semibold transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-silk-gold-500 to-silk-gold-600 hover:from-silk-gold-400 hover:to-silk-gold-500 text-stone-950 text-sm font-bold shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            <span>{loading ? 'Posting Voucher...' : 'Post Manual Voucher (Paid)'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
