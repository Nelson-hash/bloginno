import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Check if the user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // We consider both the hardcoded admin (with ID 'admin-user') 
  // and any regular authenticated user to be authorized
  if (user && (user.id === 'admin-user' || user.id)) {
    return <>{children}</>;
  }

  // If we get here, something is wrong with authentication
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
