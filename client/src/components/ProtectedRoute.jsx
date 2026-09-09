import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-silk-maroon-950 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full border-4 border-silk-gold-400/20 border-t-silk-gold-500 animate-spin mb-4"></div>
        <p className="font-brand text-silk-gold-300 text-lg tracking-wider">Shivaayaha Silk Sarees</p>
        <p className="text-stone-400 text-sm mt-1">Opening digital ledger...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
