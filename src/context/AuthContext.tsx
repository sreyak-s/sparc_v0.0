'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Member } from '@/types';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: Member | null;
  loading: boolean;
  token: string | null;
  login: (sparcId: string, password: string) => Promise<{ success: boolean; message?: string; user?: Member }>;
  activateAccount: (sparcId: string, name: string, password: string) => Promise<{ success: boolean; message?: string; user?: Member }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLeadership: boolean;
  isFounder: boolean;
  canMarkAttendance: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Member | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          const savedToken = Cookies.get('sparc_token') || null;
          setToken(savedToken);
          return;
        }
      }
      setUser(null);
      setToken(null);
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (sparcId: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sparc_id: sparcId, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.error || 'Authentication failed' };
      }

      setUser(data.user);
      setToken(data.token);
      if (data.token) {
        Cookies.set('sparc_token', data.token, { expires: 7 });
      }

      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during login' };
    }
  };

  const activateAccount = async (sparcId: string, name: string, password: string) => {
    try {
      const res = await fetch('/api/auth/create-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sparc_id: sparcId, name, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.error || 'Activation failed' };
      }

      setUser(data.user);
      setToken(data.token);
      if (data.token) {
        Cookies.set('sparc_token', data.token, { expires: 7 });
      }

      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during activation' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    Cookies.remove('sparc_token');
    setUser(null);
    setToken(null);
    window.location.href = '/';
  };

  const role = user?.role;
  const isFounder = role === 'FOUNDER';
  const isLeadership = isFounder || role === 'CAPTAIN' || role === 'VICE_CAPTAIN' || role === 'SECRETARY';
  const canMarkAttendance = isLeadership;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        login,
        activateAccount,
        logout,
        refreshUser,
        isLeadership,
        isFounder,
        canMarkAttendance
      }}
    >
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
