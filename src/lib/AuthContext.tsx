'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type User = {
  _id: string;
  email: string;
  username: string;
  profileImage?: string;
  contributionPoints?: number;
  phone?: string;
  referralCount?: number;
  isPremium?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (payload: any) => Promise<{ success: boolean; message: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch user profile
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/profile`, {
        headers: {
          'Authorization': token || '',
        },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);

        // Save premium status if available
        if (data.user?.isPremium !== undefined) {
          localStorage.setItem('isPremium', JSON.stringify(data.user.isPremium));
        }
      } else {
        setUser(null);
        localStorage.removeItem('isPremium');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setUser(null);
      localStorage.removeItem('isPremium');
    } finally {
      setLoading(false);
    }
  };

  // Run once on mount
  useEffect(() => {
    console.log('AuthProvider mounted. Backend URL:', process.env.NEXT_PUBLIC_BACKEND_API_URL);
    
    // 🛠️ Grab token from URL if redirected from Google
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      console.log('Token found in URL!', urlToken.substring(0, 10) + '...');
      localStorage.setItem('token', urlToken);
      // Clean URL without reloading
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else {
      console.log('No token found in URL.');
    }

    refreshUser();
  }, []);

  // 🚪 Logout
  const logout = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setUser(null);
        localStorage.removeItem("token")      // ✅ remove token
        localStorage.removeItem('isPremium');
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // 🔑 Login
  const login = async (emailOrUsername: string, password: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        await refreshUser();
        return { success: true, message: data.message || "Login successful" };
      }
      return { success: false, message: data.message || "Login failed" };
    } catch (err) {
      console.error("Login context error:", err);
      return { success: false, message: "Network error during login" };
    }
  };

  // 📝 Signup
  const signup = async (payload: any) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        await refreshUser();
        return { success: true, message: data.message || "Signup successful" };
      }
      return { success: false, message: data.message || "Signup failed" };
    } catch (err) {
      console.error("Signup context error:", err);
      return { success: false, message: "Network error during signup" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, refreshUser, login, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
