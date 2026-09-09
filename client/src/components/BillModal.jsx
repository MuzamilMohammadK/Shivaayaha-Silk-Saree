import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { invoiceService } from '../services/invoiceService';
import { useToast } from '../context/ToastContext';
import { formatINR, getStatusStyle } from '../utils/formatters';
import { Receipt, Calculator, ArrowRight, UserPlus, Sparkles } from 'lucide-react';

export default function BillModal({ isOpen, onClose, parties = [], onSaved, onOpenPartyModal }) {
  const { showToast } = useToast();
  const [partyId, setPartyId] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [grossAmount, setGrossAmount] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-calculated real-time balance
  const grossNum = parseFloat(grossAmount) || 0;
  const advanceNum = parseFloat(advancePaid) || 0;
  const balanceDue = Math.max(0, grossNum - advanceNum);

  let status = 'UNPAID';
  if (grossNum > 0) {
    if (balanceDue === 0) {
      status = 'PAID';
    } else if (advanceNum > 0) {
      status = 'PARTIAL';
    }
  }

  const statusStyle = getStatusStyle(status);

  useEffect(() => {
    if (isOpen) {
      // If there are parties and none selected, preselect first
      if (parties.length > 0 && !partyId) {
        setPartyId(parties[0].id);
      }
      if (!billNumber) {
        // Suggested lot number format: LOT-{DDMM}-{RAND}
        const now = new Date();
        const rand = Math.floor(100 + Math.random() * 900);
        setBillNumber(`LOT-${now.getDate()}${now.getMonth() + 1}-${rand}`);
      }
    }
  }, [isOpen, parties]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!partyId) {
      showToast('Please select a weaver or wholesale party.', 'error');
      return;
    }

    if (!billNumber.trim()) {
      showToast('Please enter the physical lot or bill number.', 'error');
      return;
    }

    if (grossNum <= 0) {
      showToast('Gross amount must be greater than zero.', 'error');
      return;
    }

    if (advanceNum > grossNum) {
      showToast('Immediate advance paid cannot exceed gross bill amount.', 'error');
      return;
    }

    try {
      setLoading(true);
      await invoiceService.createInvoice({
        partyId: Number(partyId),
        billNumber: billNumber.trim(),
        billDate,
        description: description.trim(),
        grossAmount: grossNum,
        advancePaid: advanceNum,
      });

      showToast(`Bill #${billNumber} logged successfully!`, 'success');
      // Reset form
      setBillNumber('');
      setDescription('');
      setGrossAmount('');
      setAdvancePaid('');
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Failed to log bill.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manual Saree Bill Entry"
      subtitle="Log physical purchase bills with auto-calculated balance"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Party / Weaver Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Weaver / Wholesale Party <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPartyModal();
              }}
              className="text-xs font-semibold text-silk-maroon-700 hover:text-silk-maroon-900 flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ New Weaver</span>
            </button>
          </div>

          <select
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition"
            required
          >
            <option value="">-- Select Weaver / Supplier --</option>
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.marketHub ? `(${p.marketHub})` : ''} - Due: {formatINR(p.currentNetBalance)}
              </option>
            ))}
          </select>
        </div>

        {/* Bill/Lot Number and Bill Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Bill / Lot Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              placeholder="e.g. DHM-802 or Bill #45"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Bill Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition"
              required
            />
          </div>
        </div>

        {/* Description / Silk Lot Specification */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Lot Description & Memo Details
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Dharmavaram pure pattu bridal 10 pcs lot"
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition"
          />
        </div>

        {/* Financial Inputs: Gross Amount & Advance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
              Total Gross Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-stone-500 font-bold text-base">₹</span>
              <input
                type="number"
                step="any"
                min="0"
                value={grossAmount}
                onChange={(e) => setGrossAmount(e.target.value)}
                placeholder="150000"
                className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-bold text-base focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
              Immediate Cash / Advance (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-stone-500 font-bold text-base">₹</span>
              <input
                type="number"
                step="any"
                min="0"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                placeholder="70000"
                className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-bold text-base focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* REAL-TIME LIVE CALCULATION DISPLAY */}
        <div className="bg-gradient-to-br from-silk-maroon-950 to-stone-950 text-white p-4 rounded-2xl border border-silk-gold-500/40 shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-xs text-silk-gold-300">
            <span className="flex items-center gap-1 font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Real-Time Tally Calculation</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusStyle.bg}`}>
              {statusStyle.label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div>
              <p className="text-[10px] uppercase text-stone-400 font-medium">Gross Billed</p>
              <p className="text-sm sm:text-base font-bold text-stone-200">{formatINR(grossNum)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-emerald-400 font-medium">Paid (Advance)</p>
              <p className="text-sm sm:text-base font-bold text-emerald-300">{formatINR(advanceNum)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-amber-400 font-medium">Pending (Due)</p>
              <p className="text-sm sm:text-base font-extrabold text-silk-gold-300">{formatINR(balanceDue)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-silk-maroon-800 to-silk-maroon-900 hover:from-silk-maroon-700 hover:to-silk-maroon-800 text-silk-gold-200 border border-silk-gold-500/40 text-sm font-bold shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            <Receipt className="w-4 h-4 text-silk-gold-400" />
            <span>{loading ? 'Recording...' : 'Save Manual Bill Lot'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
