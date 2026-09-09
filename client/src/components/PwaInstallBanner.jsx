import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install Shivaayaha Silk Sarees on your phone, open your browser menu (⋮) and tap "Install App" or "Add to Home Screen".');
      return;
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-silk-maroon-900 via-silk-maroon-800 to-silk-maroon-950 text-silk-gold-100 border-b border-silk-gold-500/30 px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-silk-gold-500/20 border border-silk-gold-400/40 flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4 text-silk-gold-300" />
        </div>
        <div className="truncate">
          <span className="font-semibold text-white">Shivaayaha Ledger App:</span>{' '}
          <span className="text-silk-gold-200/90 hidden xs:inline">Install on your Android phone for 1-tap ledger access.</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-silk-gold-500 to-silk-gold-600 hover:from-silk-gold-400 hover:to-silk-gold-500 text-stone-950 font-semibold text-xs transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-silk-gold-300/70 hover:text-white rounded transition"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
