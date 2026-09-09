import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local or session storage for token
    const token = localStorage.getItem('shivaayaha_token') || sessionStorage.getItem('shivaayaha_token');
    const storedUser = localStorage.getItem('shivaayaha_user');

    if (token) {
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // ignore parsing error
        }
      }

      // Verify token freshness with backend
      authService.getMe()
        .then((res) => {
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('shivaayaha_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          localStorage.removeItem('shivaayaha_token');
          sessionStorage.removeItem('shivaayaha_token');
          localStorage.removeItem('shivaayaha_user');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, rememberMe = true) => {
    const data = await authService.login({ email, password, rememberMe });
    if (data.success && data.token) {
      if (rememberMe) {
        localStorage.setItem('shivaayaha_token', data.token);
      } else {
        sessionStorage.setItem('shivaayaha_token', data.token);
      }
      localStorage.setItem('shivaayaha_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const register = async (name, email, password, confirmPassword) => {
    const data = await authService.register({ name, email, password, confirmPassword });
    if (data.success && data.token) {
      localStorage.setItem('shivaayaha_token', data.token);
      localStorage.setItem('shivaayaha_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('shivaayaha_token');
    sessionStorage.removeItem('shivaayaha_token');
    localStorage.removeItem('shivaayaha_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
