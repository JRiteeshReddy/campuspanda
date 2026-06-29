import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('cp_admin_token');

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  try {
    // Perform a basic client-side check of the JWT expiration time
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn('Admin token has expired');
      localStorage.removeItem('cp_admin_token');
      return <Navigate to="/admin" replace />;
    }
  } catch (error) {
    console.error('Error decoding admin token:', error);
    localStorage.removeItem('cp_admin_token');
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
