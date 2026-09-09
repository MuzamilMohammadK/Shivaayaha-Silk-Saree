import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { invoiceService } from '../services/invoiceService';
import { useToast } from '../context/ToastContext';
import { formatINR, formatDate, getStatusStyle } from '../utils/formatters';
import { 
  Receipt, 
  Search, 
  Plus, 
  CreditCard, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function InvoicesList({ onOpenBillModal, onOpenPaymentModal, refreshTrigger }) {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getInvoices();
      if (res.success) {
        setInvoices(res.invoices);
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to load lot bills.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [refreshTrigger]);

  const handleDelete = async (id, billNumber) => {
    if (!window.confirm(`Are you sure you want to remove Bill Lot #${billNumber}?`)) {
      return;
    }

    try {
      await invoiceService.deleteInvoice(id);
      showToast(`Bill Lot #${billNumber} removed.`, 'info');
      fetchInvoices();
    } catch (error) {
      console.error(error);
      showToast('Failed to delete bill.', 'error');
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalGross = invoices.reduce((sum, i) => sum + i.grossAmount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.totalPaid, 0);
  const totalPending = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-silk-maroon-800" />
            <h1 className="font-brand font-bold text-2xl text-stone-900">
              Manual Saree Lot Invoices
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Recorded purchase lots, advances, and remaining balance calculations
          </p>
        </div>

        <button
          onClick={onOpenBillModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-silk-maroon-800 to-silk-maroon-900 hover:from-silk-maroon-700 hover:to-silk-maroon-800 text-silk-gold-200 border border-silk-gold-500/40 text-sm font-bold shadow-md transition active:scale-95"
        >
          <Receipt className="w-4 h-4 text-silk-gold-400" />
          <span>+ Log New Saree Lot</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs text-stone-400 uppercase font-semibold">Total Gross Purchases</p>
          <p className="text-2xl font-extrabold text-stone-900 mt-1">{formatINR(totalGross)}</p>
          <p className="text-xs text-stone-500 mt-1">{invoices.length} lot bills logged</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs text-emerald-600 uppercase font-semibold">Total Advance & Payments</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{formatINR(totalPaid)}</p>
          <p className="text-xs text-stone-500 mt-1">Settled down-payments & vouchers</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs text-rose-600 uppercase font-semibold">Total Pending Due</p>
          <p className="text-2xl font-extrabold text-rose-700 mt-1">{formatINR(totalPending)}</p>
          <p className="text-xs text-stone-500 mt-1">Outstanding on purchase lots</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lot/bill #, weaver, or saree lot description..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Bills' },
            { id: 'UNPAID', label: 'Unpaid (Due)' },
            { id: 'PARTIAL', label: 'Partial' },
            { id: 'PAID', label: 'Fully Paid' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                statusFilter === tab.id
                  ? 'bg-silk-maroon-800 text-silk-gold-200 border-silk-gold-500'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-silk-maroon-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-stone-500">Loading purchase lots...</p>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Bill Date</th>
                  <th className="py-3.5 px-4 font-semibold">Lot / Bill No</th>
                  <th className="py-3.5 px-4 font-semibold">Weaver / Party</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Gross Amount</th>
                  <th className="py-3.5 px-4 font-semibold text-right text-emerald-700">Total Paid</th>
                  <th className="py-3.5 px-4 font-semibold text-right text-rose-700">Balance Due</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {filteredInvoices.map((inv) => {
                  const statusStyle = getStatusStyle(inv.status);
                  const isFullyPaid = inv.balanceDue === 0;

                  return (
                    <tr key={inv.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap">
                        {formatDate(inv.billDate)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-stone-900">
                          #{inv.billNumber}
                        </span>
                        {inv.description && (
                          <span className="block text-[11px] text-stone-500 font-normal max-w-xs truncate">
                            {inv.description}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          to={`/parties/${inv.partyId}`}
                          className="font-bold text-stone-900 hover:text-silk-maroon-800 transition block"
                        >
                          {inv.partyName}
                        </Link>
                        <span className="text-[11px] text-stone-400">
                          {inv.marketHub || 'Dharmavaram'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-stone-900 whitespace-nowrap">
                        {formatINR(inv.grossAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-emerald-700 whitespace-nowrap">
                        {formatINR(inv.totalPaid)}
                        {inv.advancePaid > 0 && inv.additionalPayments > 0 && (
                          <span className="block text-[10px] text-stone-400">
                            (Adv: {formatINR(inv.advancePaid)})
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-rose-700 whitespace-nowrap">
                        {formatINR(inv.balanceDue)}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                          <span>{statusStyle.label}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {!isFullyPaid && (
                            <button
                              onClick={() => onOpenPaymentModal(inv.partyId, inv.id)}
                              className="px-2.5 py-1 rounded-lg bg-silk-gold-500 hover:bg-silk-gold-400 text-stone-950 font-bold text-xs transition flex items-center gap-1 shadow-sm"
                              title="Record repayment for this bill"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(inv.id, inv.billNumber)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition"
                            title="Delete Bill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Receipt className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-brand font-bold text-lg text-stone-800">No lot invoices found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {searchQuery ? 'Try changing your search terms.' : 'Record your first silk saree lot purchase bill with immediate advance paid.'}
            </p>
            <button
              onClick={onOpenBillModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-silk-maroon-800 text-silk-gold-200 text-xs font-bold"
            >
              <Receipt className="w-4 h-4 text-silk-gold-400" />
              <span>+ Record New Bill Lot</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
