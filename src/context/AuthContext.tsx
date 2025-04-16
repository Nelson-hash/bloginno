import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const checkSession = () => {
      const session = localStorage.getItem('blogInnoSession');
      if (session) {
        try {
          const userData = JSON.parse(session);
          setIsAuthenticated(true);
          setUser(userData);
        } catch (err) {
          console.error('Invalid session data:', err);
          localStorage.removeItem('blogInnoSession');
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // For demo purposes, we're using hardcoded credentials
      // In a real app, this would validate against your Supabase auth
      if (username === 'Inno' && password === '2025') {
        const userData = {
          id: '1',
          email: username
        };
        
        // Save to localStorage for persistence
        localStorage.setItem('blogInnoSession', JSON.stringify(userData));
        
        setIsAuthenticated(true);
        setUser(userData);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear local session
      localStorage.removeItem('blogInnoSession');
      
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
