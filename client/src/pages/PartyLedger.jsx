import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { partyService } from '../services/partyService';
import { useToast } from '../context/ToastContext';
import { formatINR, formatDate, getPaymentModeDetails } from '../utils/formatters';
import { 
  BookOpen, 
  ArrowLeft, 
  Receipt, 
  CreditCard, 
  Printer, 
  Phone, 
  MapPin, 
  Scale, 
  FileText,
  Calendar,
  Share2
} from 'lucide-react';

export default function PartyLedger({ onOpenBillModal, onOpenPaymentModal, refreshTrigger }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await partyService.getPartyLedger(id);
      if (res.success) {
        setData(res);
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to load party ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [id, refreshTrigger]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-silk-maroon-800 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-stone-500 font-medium">Calculating chronological running ledger...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-stone-600">Party not found.</p>
        <Link to="/parties" className="text-silk-maroon-800 font-bold text-sm mt-2 inline-block">
          &larr; Back to Parties Directory
        </Link>
      </div>
    );
  }

  const { party, ledger } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12 space-y-6 print:p-0 print:m-0">
      
      {/* Navigation & Action Bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/parties')}
            className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 transition"
            title="Back to directory"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand font-bold text-2xl text-stone-900">{party.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                {party.marketHub || 'Dharmavaram'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">Chronological Manual Ledger & Running Balance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            <span>Print Ledger</span>
          </button>

          <button
            onClick={() => onOpenBillModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-silk-maroon-800 hover:bg-silk-maroon-700 text-silk-gold-200 font-bold text-xs shadow-sm transition"
          >
            <Receipt className="w-4 h-4 text-silk-gold-400" />
            <span>+ Bill Lot</span>
          </button>

          <button
            onClick={() => onOpenPaymentModal(party.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-silk-gold-500 to-silk-gold-600 hover:from-silk-gold-400 hover:to-silk-gold-500 text-stone-950 font-bold text-xs shadow-md transition"
          >
            <CreditCard className="w-4 h-4" />
            <span>+ Pay (Paid)</span>
          </button>
        </div>
      </div>

      {/* Printable Statement Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm print:border-none print:shadow-none print:p-2">
        
        {/* Print Brand Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-stone-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-silk-gold-500 p-0.5 bg-silk-maroon-950 shrink-0">
              <img src="/logo.jpg" alt="Shivaayaha Silk Sarees" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <h2 className="font-brand font-bold text-xl sm:text-2xl text-silk-maroon-900 tracking-wider">
                Shivaayaha Silk Sarees
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                Dharmavaram &bull; Master Pattu Weavers & Wholesale Ledger
              </p>
            </div>
          </div>

          <div className="sm:text-right text-xs text-stone-500">
            <p className="font-semibold text-stone-800">Ledger Statement Date</p>
            <p>{formatDate(new Date().toISOString())}</p>
          </div>
        </div>

        {/* Weaver Information & Running Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Party Details</p>
            <p className="font-brand font-bold text-stone-900 text-base">{party.name}</p>
            {party.phone && (
              <p className="text-xs text-stone-600 mt-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{party.phone}</span>
              </p>
            )}
            <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>{party.marketHub || 'Dharmavaram'}</span>
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Tally Aggregates</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-stone-500">Total Purchases:</span>
                <p className="font-bold text-stone-800">{formatINR(party.totalDebit)}</p>
              </div>
              <div>
                <span className="text-emerald-700">Total Paid (Paid):</span>
                <p className="font-bold text-emerald-700">{formatINR(party.totalCredit)}</p>
              </div>
            </div>
            <div className="pt-2 mt-2 border-t border-stone-200 text-xs text-stone-500 flex justify-between">
              <span>Opening Ledger:</span>
              <span className="font-semibold text-stone-700">{formatINR(party.openingBalance)}</span>
            </div>
          </div>

          {/* Current Running Net Balance */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
            party.currentNetBalance > 0
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <p className="text-[11px] font-bold uppercase tracking-wider">
              {party.currentNetBalance > 0 ? 'Current Net Outstanding (Due)' : 'Account Settled'}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight my-1">
              {formatINR(party.currentNetBalance)}
            </p>
            <p className="text-[11px] opacity-80">
              {party.currentNetBalance > 0 ? 'Amount payable to weaver' : 'All accounts fully cleared'}
            </p>
          </div>
        </div>

        {/* Chronological Ledger Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-stone-100 text-stone-700 border-y border-stone-300 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Type & Details</th>
                <th className="py-3 px-3">Voucher / Lot Ref</th>
                <th className="py-3 px-3 text-right text-stone-900">Debit / Lot (Debit)</th>
                <th className="py-3 px-3 text-right text-emerald-800">Credit / Paid (Credit)</th>
                <th className="py-3 px-3 text-right text-silk-maroon-900 font-extrabold">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-sans">
              {ledger.length > 0 ? (
                ledger.map((row) => {
                  const isDebit = !!row.debit;
                  const isCredit = !!row.credit;
                  const isOpening = row.type === 'OPENING_BALANCE';
                  const isBill = row.type === 'INVOICE_BILL';
                  const isAdvance = row.type === 'ADVANCE_PAYMENT';

                  return (
                    <tr key={row.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-3 text-stone-600 whitespace-nowrap font-medium">
                        {formatDate(row.date)}
                      </td>
                      
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-900">{row.title}</div>
                        {row.description && (
                          <div className="text-[11px] text-stone-500 line-clamp-1">{row.description}</div>
                        )}
                        {row.mode && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600">
                            {row.mode}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono text-xs text-stone-700">
                        {row.ref || '-'}
                      </td>

                      {/* Debit (Debit) - Saree Purchases / We Owe */}
                      <td className="py-3 px-3 text-right font-bold text-stone-900 whitespace-nowrap">
                        {isDebit ? formatINR(row.debitFormatted) : '-'}
                      </td>

                      {/* Credit (Credit) - Paid Payments / We Paid */}
                      <td className="py-3 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                        {isCredit ? formatINR(row.creditFormatted) : '-'}
                      </td>

                      {/* Running Balance */}
                      <td className="py-3 px-3 text-right font-extrabold text-silk-maroon-950 whitespace-nowrap bg-stone-50/50">
                        {formatINR(row.runningBalance)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-stone-500">
                    No transactions or bills logged yet for this party.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Total Row */}
            {ledger.length > 0 && (
              <tfoot>
                <tr className="bg-stone-100/90 border-t-2 border-stone-300 font-bold text-xs sm:text-sm">
                  <td colSpan="3" className="py-3.5 px-3 text-right uppercase tracking-wider text-stone-700">
                    Grand Totals:
                  </td>
                  <td className="py-3.5 px-3 text-right text-stone-900">
                    {formatINR(party.totalDebit)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-emerald-800">
                    {formatINR(party.totalCredit)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-silk-maroon-900 font-extrabold text-base">
                    {formatINR(party.currentNetBalance)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Footer Note for Print Statement */}
        <div className="mt-8 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <p>Generated by Shivaayaha Silk Sarees Manual Ledger Management System.</p>
          <p className="font-semibold text-stone-700">Authorized Signature: _______________________</p>
        </div>

      </div>

    </div>
  );
}
