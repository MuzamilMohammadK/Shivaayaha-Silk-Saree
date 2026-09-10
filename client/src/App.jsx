import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

// Components
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import PwaInstallBanner from './components/PwaInstallBanner';
import BillModal from './components/BillModal';
import PaymentModal from './components/PaymentModal';
import PartyModal from './components/PartyModal';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import PartiesList from './pages/PartiesList';
import PartyLedger from './pages/PartyLedger';
import InvoicesList from './pages/InvoicesList';

// Services
import { partyService } from './services/partyService';

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  // Modals state
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [partyModalOpen, setPartyModalOpen] = useState(false);

  // Preselected payment params
  const [preselectedPartyId, setPreselectedPartyId] = useState(null);
  const [preselectedInvoiceId, setPreselectedInvoiceId] = useState(null);

  // Parties cache for modal dropdowns
  const [parties, setParties] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const reloadParties = () => {
    if (isAuthenticated) {
      partyService.getParties()
        .then((res) => {
          if (res.success) setParties(res.parties);
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    reloadParties();
  }, [isAuthenticated, refreshTrigger]);

  const handleOpenPaymentModal = (partyId = null, invoiceId = null) => {
    setPreselectedPartyId(partyId);
    setPreselectedInvoiceId(invoiceId);
    setPaymentModalOpen(true);
  };

  const handleDataChanged = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 font-sans selection:bg-silk-maroon-800 selection:text-silk-gold-200">
      
      {/* PWA Mobile App Download Prompt Banner */}
      <PwaInstallBanner />

      {/* Top Brand Navbar (Authenticated sessions) */}
      {isAuthenticated && (
        <Navbar
          onOpenBillModal={() => setBillModalOpen(true)}
          onOpenPaymentModal={() => handleOpenPaymentModal()}
          onOpenPartyModal={() => setPartyModalOpen(true)}
        />
      )}

      {/* Main Page Routing */}
      <main className="flex-1">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Manual Ledger Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard
                  onOpenBillModal={() => setBillModalOpen(true)}
                  onOpenPaymentModal={handleOpenPaymentModal}
                  onOpenPartyModal={() => setPartyModalOpen(true)}
                  refreshTrigger={refreshTrigger}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/parties"
            element={
              <ProtectedRoute>
                <PartiesList
                  onOpenPartyModal={() => setPartyModalOpen(true)}
                  onOpenBillModal={() => setBillModalOpen(true)}
                  onOpenPaymentModal={handleOpenPaymentModal}
                  refreshTrigger={refreshTrigger}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/parties/:id"
            element={
              <ProtectedRoute>
                <PartyLedger
                  onOpenBillModal={() => setBillModalOpen(true)}
                  onOpenPaymentModal={handleOpenPaymentModal}
                  refreshTrigger={refreshTrigger}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <InvoicesList
                  onOpenBillModal={() => setBillModalOpen(true)}
                  onOpenPaymentModal={handleOpenPaymentModal}
                  refreshTrigger={refreshTrigger}
                />
              </ProtectedRoute>
            }
          />

          {/* Root Fallback */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>

      {/* Mobile Android Bottom Bar */}
      {isAuthenticated && (
        <MobileNav
          onOpenBillModal={() => setBillModalOpen(true)}
          onOpenPaymentModal={() => handleOpenPaymentModal()}
          onOpenPartyModal={() => setPartyModalOpen(true)}
        />
      )}

      {/* Global Manual Entry Modals */}
      {isAuthenticated && (
        <>
          <BillModal
            isOpen={billModalOpen}
            onClose={() => setBillModalOpen(false)}
            parties={parties}
            onSaved={handleDataChanged}
            onOpenPartyModal={() => setPartyModalOpen(true)}
          />

          <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => {
              setPaymentModalOpen(false);
              setPreselectedPartyId(null);
              setPreselectedInvoiceId(null);
            }}
            parties={parties}
            preselectedPartyId={preselectedPartyId}
            preselectedInvoiceId={preselectedInvoiceId}
            onSaved={handleDataChanged}
          />

          <PartyModal
            isOpen={partyModalOpen}
            onClose={() => setPartyModalOpen(false)}
            onSaved={handleDataChanged}
          />
        </>
      )}

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/Shivaayaha-Silk-Saree">
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
