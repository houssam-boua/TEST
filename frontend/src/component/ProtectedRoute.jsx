import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getRole, getToken } from '../services/apiConnection';

const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectPath = '/login',
}) => {
  const location = useLocation();
  const token = getToken();

  // Check if user is authenticated
  if (!token) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Get user role from token (assuming token contains role information)
  // You may need to modify this based on how your token stores role information
  const userRole = getRole();

  // Check if user has permission
  if (allowedRoles) {
    // Redirect based on role even if authenticated
    if (userRole === 'admin') {
      return <Navigate to='/a/acceuil' replace />;
    } else if (userRole === 'validator') {
      return <Navigate to='/v/acceuil' replace />;
    } else {
      return <Navigate to='/u/acceuil' replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
