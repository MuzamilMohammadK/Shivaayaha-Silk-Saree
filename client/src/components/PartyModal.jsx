import React, { useState } from 'react';
import Modal from './Modal';
import { partyService } from '../services/partyService';
import { useToast } from '../context/ToastContext';
import { UserPlus, Building, Phone, MapPin, History } from 'lucide-react';

export default function PartyModal({ isOpen, onClose, onSaved }) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [marketHub, setMarketHub] = useState('Dharmavaram');
  const [historicOpeningBalance, setHistoricOpeningBalance] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const marketHubOptions = [
    'Dharmavaram',
    'Kanchipuram',
    'Banaras / Varanasi',
    'Surat',
    'Bangalore',
    'Uppada',
    'Pochampally',
    'Gadwal',
    'Chanderi',
    'Other Market Hub',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter the weaver or shop name.', 'error');
      return;
    }

    try {
      setLoading(true);
      await partyService.createParty({
        name: name.trim(),
        phone: phone.trim(),
        marketHub,
        historicOpeningBalance: parseFloat(historicOpeningBalance) || 0,
        notes: notes.trim(),
      });

      showToast(`Party "${name}" registered in directory!`, 'success');
      setName('');
      setPhone('');
      setHistoricOpeningBalance('');
      setNotes('');
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Failed to add party.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Weaver / Wholesale Party"
      subtitle="Register supplier, loom owner, or silk merchant"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Party / Weaver Name */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Weaver / Shop Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shivaayaha Silk Weavers or Sri Rama Pattu Handlooms"
              className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 focus:ring-2 focus:ring-silk-gold-200 outline-none transition"
              required
            />
          </div>
        </div>

        {/* Phone Number & Market Hub */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Contact Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9848022338"
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Market Hub / Cluster
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <select
                value={marketHub}
                onChange={(e) => setMarketHub(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 outline-none transition"
              >
                {marketHubOptions.map((hub) => (
                  <option key={hub} value={hub}>{hub}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Historic Opening Balance */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Historic Opening Balance (Brought forward Due)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-stone-500 font-bold text-base">₹</span>
            <input
              type="number"
              step="any"
              value={historicOpeningBalance}
              onChange={(e) => setHistoricOpeningBalance(e.target.value)}
              placeholder="0 (Or old paper diary balance)"
              className="w-full pl-8 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 outline-none transition"
            />
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Amount currently pending from previous physical ledger diaries.
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Notes / Address Details
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Master weaver in Main Bazar Dharmavaram"
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-silk-gold-500 outline-none transition"
          />
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
            <UserPlus className="w-4 h-4 text-silk-gold-400" />
            <span>{loading ? 'Adding...' : 'Register Weaver / Party'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
