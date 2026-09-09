import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop tap to close */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Modal Container: Bottom Sheet on Mobile, Centered Card on Desktop */}
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-stone-200 overflow-hidden z-10 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[92vh] flex flex-col`}
      >
        {/* Mobile Pull Bar */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-stone-300"></div>
        </div>

        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-silk-maroon-950 via-silk-maroon-900 to-silk-maroon-950 text-white flex items-center justify-between border-b border-silk-gold-500/30">
          <div>
            <h3 className="font-brand font-bold text-lg text-silk-gold-200 tracking-wide">{title}</h3>
            {subtitle && <p className="text-xs text-stone-300 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-silk-maroon-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
