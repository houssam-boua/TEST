import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../services/apiConnection';

const PrivateRoute = ({ element }) => {
  const isAuthenticated = !!getToken();
  return isAuthenticated ? element : <Navigate to='/signin' replace />;
};

const RedirectIfAuthenticated = ({ element }) => {
  const isAuthenticated = !!getToken();
  return isAuthenticated ? <Navigate to='/' replace /> : element;
};

export default { PrivateRoute, RedirectIfAuthenticated };
