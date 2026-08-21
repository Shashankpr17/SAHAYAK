import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('sahayak_token');
  if (!token) {
    console.log("[AUTH] Unauthenticated route access attempt, redirecting to Landing Page");
    return <Navigate to="/" replace />;
  }
  return children;
};
