import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Hardcoded admin credentials
const ADMIN_EMAIL = "iavengers";
const ADMIN_PASSWORD = "inno2025@studio";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if the credentials match the hardcoded admin values
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Create a custom fake session
        const fakeUser = {
          id: 'admin-user',
          email: 'admin@bloginno.com',
          app_metadata: { provider: 'email' },
          user_metadata: { full_name: 'Admin User' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User;

        setIsAuthenticated(true);
        setUser(fakeUser);
        
        // Store admin authentication in localStorage to persist across page refreshes
        localStorage.setItem('bloginno_admin_auth', JSON.stringify({
          isAuthenticated: true,
          user: fakeUser
        }));
        
        return true;
      }
      
      // If not the hardcoded admin, revert to regular Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      setIsAuthenticated(!!data.session);
      setUser(data.session?.user || null);
      return !!data.session;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Check if it's the hardcoded admin user
      if (user?.id === 'admin-user') {
        // Clear admin authentication from localStorage
        localStorage.removeItem('bloginno_admin_auth');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      // Otherwise, use the regular Supabase logout
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Check for stored admin authentication on component mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('bloginno_admin_auth');
    if (storedAuth) {
      try {
        const { isAuthenticated: isAuth, user: storedUser } = JSON.parse(storedAuth);
        if (isAuth && storedUser) {
          setIsAuthenticated(true);
          setUser(storedUser as User);
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('bloginno_admin_auth');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
