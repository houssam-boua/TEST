import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { Dashboard } from '../pages/Dashboard';
import { NotFound } from '../pages/NotFound';
import { RoleBasedLayout } from '../components/layouts/RoleBasedLayout';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute: React.FC<{ 
  element: React.ReactElement;
  requiredRole?: 'admin' | 'manager' | 'user';
}> = ({ element, requiredRole }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Private Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute
            element={<Dashboard />}
          />
        }
      />

      {/* Role-based Routes */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute
            element={<RoleBasedLayout requiredRole="admin"><Dashboard /></RoleBasedLayout>}
            requiredRole="admin"
          />
        }
      />

      <Route
        path="/manager/*"
        element={
          <PrivateRoute
            element={<RoleBasedLayout requiredRole="manager"><Dashboard /></RoleBasedLayout>}
            requiredRole="manager"
          />
        }
      />

      {/* Catch-all Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
