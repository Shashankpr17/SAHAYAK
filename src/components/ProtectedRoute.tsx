import React from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenExpired, clearAuthSession } from '../services/api';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('sahayak_token');
  
  if (!token || isTokenExpired(token)) {
    if (token) {
      console.log("[AUTH] Expired token detected in ProtectedRoute, clearing session and redirecting to Landing Page");
      clearAuthSession();
    } else {
      console.log("[AUTH] Unauthenticated route access attempt, redirecting to Landing Page");
    }
    return <Navigate to="/" replace />;
  }
  
  return children;
};
