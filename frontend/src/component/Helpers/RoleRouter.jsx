import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getRole, getToken } from '../../services/apiConnection';

const RoleRouter = () => {
  const role = getRole();
  const token = getToken();

  useEffect(() => {
    // Extra validation to make sure we have both token and role
    if (!token || !role) {
      window.location.href = '/login';
      return;
    }
  }, [token, role]);

  if (role === 'admin') {
    return <Navigate to='/a/acceuil' replace />;
  } else if (role === 'validator') {
    return <Navigate to='/v/acceuil' replace />;
  } else if (role === 'user') {
    return <Navigate to='/u/acceuil' replace />;
  } else {
    // Invalid role, go back to login
    return <Navigate to='/login' replace />;
  }
};
  
export default RoleRouter;
