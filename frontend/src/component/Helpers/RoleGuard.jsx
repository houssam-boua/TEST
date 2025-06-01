import React from 'react';
import { Navigate } from "react-router-dom";
import { getRole } from "../../services/apiConnection";

const RoleGuard = ({ requiredRole, children }) => {
  const role = getRole();

  if (!role) {
    return <Navigate to='/login' replace />;
  }

  // If user doesn't have the required role, redirect to their role-specific homepage
  if (role !== requiredRole) {
    if (role === 'admin') {
      return <Navigate to='/a/acceuil' replace />;
    } else if (role === 'validator') {
      return <Navigate to='/v/acceuil' replace />;
    } else if (role === 'user') {
      return <Navigate to='/u/acceuil' replace />;
    } else {
      // If role is invalid, log out and redirect to login
      return <Navigate to='/login' replace />;
    }
  }

  return children;
};

export default RoleGuard;