import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getRole, getToken } from '../services/apiConnection';

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectPath = '/login',
}) => {
  const location = useLocation();
  const token = getToken();
  const userRole = getRole();

  console.log('userRole', userRole);
  console.log('token', token);  

  // Check if user is authenticated
  if (!token) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Check if user has permission for this route
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // User doesn't have permission for this route, redirect to their appropriate dashboard
    if (userRole === 'admin') {
      return <Navigate to='/a/acceuil' replace />;
    } else if (userRole === 'validator') {
      return <Navigate to='/v/acceuil' replace />;
    } else if (userRole === 'user') {
      return <Navigate to='/u/acceuil' replace />;
    } else {
      // Fallback if role is unknown
      return <Navigate to={redirectPath} replace />;
    }
  }

  // User is authenticated and has permission, show the protected content
  return children;
};

export default ProtectedRoute;
