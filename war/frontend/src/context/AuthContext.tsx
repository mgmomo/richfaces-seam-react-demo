import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchCurrentUser } from '../api/authApi';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isUser: boolean;
  login: (username: string, role: string) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchCurrentUser();
      setUser(data);
    } catch {
      setUser({ username: 'anonymous', role: 'GUEST' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback((username: string, role: string) => {
    localStorage.setItem('auth_user', username);
    localStorage.setItem('auth_role', role);
    setUser({ username, role });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
    setUser({ username: 'anonymous', role: 'GUEST' });
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isUser, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
