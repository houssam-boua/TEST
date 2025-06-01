import React from 'react';
import { getToken } from '../../services/apiConnection';
import { Navigate } from 'react-router-dom';
const AuthGuard = ({ children }) => {
  const token = getToken();

  if (!token) {
    return <Navigate to='/login' replace />;
  }

  return children;
};

export default AuthGuard;
