import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { storage } from './storage';
import { generateId } from './validation';
import type { User } from './types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sessionId = await storage.getSession();
      if (sessionId) {
        const users = await storage.getUsers();
        const found = users.find((u) => u.id === sessionId);
        if (found) setUser(found);
      }
      setLoading(false);
    })();
  }, []);

  async function login(email: string, password: string) {
    const users = await storage.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) return { success: false, error: 'No account found with this email' };
    if (found.password !== password) return { success: false, error: 'Incorrect password' };
    await storage.setSession(found.id);
    setUser(found);
    return { success: true };
  }

  async function register(name: string, email: string, password: string) {
    const users = await storage.getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) return { success: false, error: 'An account with this email already exists' };
    const newUser: User = {
      id: generateId(),
      name: name.trim(),
      email: email.trim(),
      password,
      createdAt: Date.now(),
    };
    users.push(newUser);
    await storage.saveUsers(users);
    await storage.setSession(newUser.id);
    setUser(newUser);
    return { success: true };
  }

  async function logout() {
    await storage.clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
