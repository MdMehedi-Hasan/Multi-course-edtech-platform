import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/index';
import { api, getStoredToken, setStoredToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  loginWithGoogle: (data: { email: string; name: string; avatarUrl?: string; googleId?: string }) => Promise<User>;
  demoLogin: (role: UserRole) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      console.error('Failed to verify token:', err);
      setStoredToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setStoredToken(res.accessToken);
      const authUser: User = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name || res.user.email.split('@')[0],
        role: res.user.role,
        avatarUrl: res.user.avatarUrl,
        createdAt: res.user.createdAt,
      };
      setUser(authUser);
      return authUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password });
      setStoredToken(res.accessToken);
      const authUser: User = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name || name,
        role: res.user.role,
        avatarUrl: res.user.avatarUrl,
        createdAt: res.user.createdAt,
      };
      setUser(authUser);
      return authUser;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (data: {
    email: string;
    name: string;
    avatarUrl?: string;
    googleId?: string;
  }): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.googleAuth(data);
      setStoredToken(res.accessToken);
      const authUser: User = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name || data.name,
        role: res.user.role,
        avatarUrl: res.user.avatarUrl || data.avatarUrl,
        createdAt: res.user.createdAt,
      };
      setUser(authUser);
      return authUser;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(role);
      setStoredToken(res.accessToken);
      const authUser: User = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name || res.user.email.split('@')[0],
        role: res.user.role,
        avatarUrl: res.user.avatarUrl,
        createdAt: res.user.createdAt,
      };
      setUser(authUser);
      return authUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        demoLogin,
        logout,
        refreshUser,
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
