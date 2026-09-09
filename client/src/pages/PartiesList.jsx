import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { partyService } from '../services/partyService';
import { useToast } from '../context/ToastContext';
import { formatINR, formatDate } from '../utils/formatters';
import { 
  Users, 
  Search, 
  UserPlus, 
  BookOpen, 
  Receipt, 
  CreditCard, 
  Phone, 
  MapPin, 
  Scale, 
  Filter, 
  Trash2,
  ExternalLink
} from 'lucide-react';

export default function PartiesList({ onOpenPartyModal, onOpenBillModal, onOpenPaymentModal, refreshTrigger }) {
  const { showToast } = useToast();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHub, setSelectedHub] = useState('ALL');

  const fetchParties = async () => {
    try {
      setLoading(true);
      const res = await partyService.getParties();
      if (res.success) {
        setParties(res.parties);
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to load weavers and parties.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, [refreshTrigger]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" and all associated Ledger records?`)) {
      return;
    }

    try {
      await partyService.deleteParty(id);
      showToast(`Party "${name}" removed.`, 'info');
      fetchParties();
    } catch (error) {
      console.error(error);
      showToast('Failed to delete party.', 'error');
    }
  };

  const hubs = ['ALL', ...new Set(parties.map((p) => p.marketHub).filter(Boolean))];

  const filteredParties = parties.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.marketHub?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHub = selectedHub === 'ALL' || p.marketHub === selectedHub;
    return matchesSearch && matchesHub;
  });

  const totalOutstanding = parties.reduce((sum, p) => sum + p.currentNetBalance, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-silk-maroon-800" />
            <h1 className="font-brand font-bold text-2xl text-stone-900">
              Weavers & Wholesale Parties Directory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage Dharmavaram, Kanchipuram & Banaras weavers and master Ledger books
          </p>
        </div>

        <button
          onClick={onOpenPartyModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-silk-maroon-800 to-silk-maroon-900 hover:from-silk-maroon-700 hover:to-silk-maroon-800 text-silk-gold-200 border border-silk-gold-500/40 text-sm font-bold shadow-md transition active:scale-95"
        >
          <UserPlus className="w-4 h-4 text-silk-gold-400" />
          <span>+ Register New Weaver</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-silk-maroon-950 text-white rounded-2xl p-4 sm:p-5 border border-silk-gold-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-silk-gold-500/20 border border-silk-gold-400/40 flex items-center justify-center text-silk-gold-300 shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-silk-gold-200/80 uppercase font-semibold">Net Total Payable Due</p>
            <p className="text-2xl font-extrabold text-silk-gold-300">{formatINR(totalOutstanding)}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-stone-300 border-t sm:border-t-0 sm:border-l border-stone-800 pt-3 sm:pt-0 sm:pl-6">
          <div>
            <p className="text-stone-400">Total Suppliers</p>
            <p className="text-base font-bold text-white">{parties.length}</p>
          </div>
          <div>
            <p className="text-stone-400">Hubs Active</p>
            <p className="text-base font-bold text-white">{hubs.length > 1 ? hubs.length - 1 : 1}</p>
          </div>
        </div>
      </div>

      {/* Search & Hub Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search weaver name, phone, or market hub..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition"
          />
        </div>

        {/* Hub Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {hubs.map((hub) => (
            <button
              key={hub}
              onClick={() => setSelectedHub(hub)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                selectedHub === hub
                  ? 'bg-silk-maroon-800 text-silk-gold-200 border-silk-gold-500'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {hub === 'ALL' ? 'All Market Hubs' : hub}
            </button>
          ))}
        </div>
      </div>

      {/* Parties Grid / Cards */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-silk-maroon-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-stone-500">Loading party ledger balances...</p>
        </div>
      ) : filteredParties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParties.map((party) => {
            const hasPending = party.currentNetBalance > 0;
            return (
              <div
                key={party.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-silk-gold-400/70 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Name & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-silk-maroon-900 to-silk-maroon-950 text-silk-gold-300 font-brand font-bold text-lg flex items-center justify-center border border-silk-gold-500/40 shrink-0">
                        {party.name.charAt(0)}
                      </div>
                      <div>
                        <Link
                          to={`/parties/${party.id}`}
                          className="font-brand font-bold text-base text-stone-900 group-hover:text-silk-maroon-800 transition"
                        >
                          {party.name}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-silk-maroon-700" />
                          <span>{party.marketHub || 'Dharmavaram'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(party.id, party.name)}
                      className="text-stone-300 hover:text-rose-600 p-1 rounded-lg transition opacity-0 group-hover:opacity-100"
                      title="Delete Party"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Phone & Notes */}
                  {party.phone && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-600 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <a href={`tel:${party.phone}`} className="font-medium hover:text-silk-maroon-800">
                        {party.phone}
                      </a>
                    </div>
                  )}

                  {party.notes && (
                    <p className="mt-2 text-xs text-stone-500 line-clamp-1 italic">
                      "{party.notes}"
                    </p>
                  )}

                  {/* Balance Matrix */}
                  <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-stone-400 uppercase text-[10px] font-semibold">Total Purchases</p>
                      <p className="font-bold text-stone-800">{formatINR(party.totalInvoiced)}</p>
                    </div>
                    <div>
                      <p className="text-emerald-700 uppercase text-[10px] font-semibold">Total Paid (Paid)</p>
                      <p className="font-bold text-emerald-700">{formatINR(party.totalPaid)}</p>
                    </div>
                  </div>

                  {/* Net Outstanding Balance Highlight */}
                  <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between ${
                    hasPending
                      ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  }`}>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider">
                        {hasPending ? 'Pending Balance (Due)' : 'Ledger Balance Cleared'}
                      </p>
                      <p className="text-lg font-extrabold">{formatINR(party.currentNetBalance)}</p>
                    </div>
                    <Scale className={`w-5 h-5 ${hasPending ? 'text-rose-500' : 'text-emerald-500'}`} />
                  </div>
                </div>

                {/* Quick Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                  <Link
                    to={`/parties/${party.id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-silk-maroon-800 hover:bg-silk-maroon-700 text-silk-gold-200 text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-silk-gold-400" />
                    <span>View Ledger</span>
                  </Link>

                  <button
                    onClick={onOpenPaymentModal}
                    className="py-2 px-3 rounded-xl bg-silk-gold-500 hover:bg-silk-gold-400 text-stone-950 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    title="Record Repayment Voucher"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
          <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-brand font-bold text-lg text-stone-800">No parties found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? 'Try changing your search keywords.' : 'Add your first weaver or wholesale shop to begin manual bookkeeping.'}
          </p>
          <button
            onClick={onOpenPartyModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-silk-maroon-800 text-silk-gold-200 text-xs font-bold"
          >
            <UserPlus className="w-4 h-4 text-silk-gold-400" />
            <span>+ Add Weaver Now</span>
          </button>
        </div>
      )}

    </div>
  );
}
