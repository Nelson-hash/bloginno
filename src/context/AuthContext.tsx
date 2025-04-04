import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { 
  User,
  createUserWithEmailAndPassword,
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

// Identifiants admin spéciaux
const ADMIN_USERNAME = "iavengers";
const ADMIN_PASSWORD = "inno2025@studio";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Vérifier l'authentification stockée localement
    const storedAuth = localStorage.getItem('bloginno_admin_auth');
    if (storedAuth) {
      try {
        const { isAuth, adminUser } = JSON.parse(storedAuth);
        if (isAuth) {
          setIsAuthenticated(true);
          setUser(adminUser as User);
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('bloginno_admin_auth');
      }
    }

    // Écouter les changements d'état d'authentification Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Vérifier d'abord si ce sont les identifiants admin spéciaux
      if (email === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Créer un admin spécial
        const adminUser = {
          uid: 'admin-user',
          email: 'admin@bloginno.com',
          displayName: 'Admin User',
          isAdmin: true,
        } as unknown as User;

        setIsAuthenticated(true);
        setUser(adminUser);
        
        // Stocker dans localStorage
        localStorage.setItem('bloginno_admin_auth', JSON.stringify({
          isAuth: true,
          adminUser
        }));
        
        return true;
      }
      
      // Sinon, essayer l'authentification Firebase
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return !!userCredential.user;
      } catch (firebaseError) {
        console.error('Firebase auth error:', firebaseError);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (user?.uid === 'admin-user') {
        // Déconnexion de l'admin spécial
        localStorage.removeItem('bloginno_admin_auth');
      } else {
        // Déconnexion Firebase
        await signOut(auth);
      }
      
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
