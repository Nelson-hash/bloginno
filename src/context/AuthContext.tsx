import React, { createContext, useContext, useState, useEffect } from 'react';

// Type simplifié pour remplacer User de Firebase
interface SimpleUser {
  id: string;
  email: string | null;
  displayName?: string | null;
  isAdmin?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: SimpleUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Hardcoded admin credentials
const ADMIN_EMAIL = "iavengers";
const ADMIN_PASSWORD = "inno2025@studio";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<SimpleUser | null>(null);

  // Vérifier si nous avons déjà un admin en session locale au chargement
  useEffect(() => {
    const storedAuth = localStorage.getItem('bloginno_admin_auth');
    if (storedAuth) {
      try {
        const { isAuth, adminUser } = JSON.parse(storedAuth);
        if (isAuth && adminUser) {
          setIsAuthenticated(true);
          setUser(adminUser as SimpleUser);
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('bloginno_admin_auth');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Vérifier si ce sont les identifiants admin
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Créer une fausse session admin
        const adminUser: SimpleUser = {
          id: 'admin-user',
          email: 'admin@bloginno.com',
          displayName: 'Admin User',
          isAdmin: true,
        };

        setIsAuthenticated(true);
        setUser(adminUser);
        
        // Stocker l'authentification admin dans localStorage
        localStorage.setItem('bloginno_admin_auth', JSON.stringify({
          isAuth: true,
          adminUser
        }));
        
        return true;
      }
      
      // Si ce ne sont pas les identifiants admin, échec de connexion
      return false;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Supprimer les données d'authentification du localStorage
      localStorage.removeItem('bloginno_admin_auth');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
