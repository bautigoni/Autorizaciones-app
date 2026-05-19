import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@shared/types';
import { api } from './api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  switchRole: (u: User) => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = 'nexoescolar.user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: u } = await api.login(email, password);
      setUser(u);
      return u;
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const switchRole = useCallback((u: User) => setUser(u), []);

  return <Ctx.Provider value={{ user, loading, login, logout, switchRole }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth outside provider');
  return c;
}
