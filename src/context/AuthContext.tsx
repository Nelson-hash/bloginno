import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Hardcoded admin credentials - nous conservons cette approche
const ADMIN_EMAIL = "iavengers@bloginno.com";
const ADMIN_PASSWORD = "inno2025@studio";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Observer pour les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setIsAuthenticated(!!currentUser);
      setUser(currentUser);
    });

    // Vérifier si nous avons déjà un admin en session locale
    const storedAuth = localStorage.getItem('bloginno_admin_auth');
    if (storedAuth) {
      try {
        const { isAuth, adminUser } = JSON.parse(storedAuth);
        if (isAuth && !user) {
          setIsAuthenticated(true);
          setUser(adminUser as User);
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('bloginno_admin_auth');
      }
    }

    // Clean up the observer when component unmounts
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Vérifier si ce sont les identifiants admin
      if (email === "iavengers" && password === "inno2025@studio") {
        // Créer une fausse session admin
        const adminUser = {
          uid: 'admin-user',
          email: ADMIN_EMAIL,
          displayName: 'Admin User',
          isAdmin: true,
        } as unknown as User;

        setIsAuthenticated(true);
        setUser(adminUser);
        
        // Stocker l'authentification admin dans localStorage
        localStorage.setItem('bloginno_admin_auth', JSON.stringify({
          isAuth: true,
          adminUser
        }));
        
        return true;
      }
      
      // Sinon, utiliser Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return !!userCredential.user;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Vérifier s'il s'agit de l'utilisateur admin
      if (user?.uid === 'admin-user') {
        localStorage.removeItem('bloginno_admin_auth');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      // Sinon, utiliser Firebase Auth
      await signOut(auth);
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
