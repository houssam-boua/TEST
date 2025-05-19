import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import React from 'react';
import UserLayout from './layouts/UserLayout';
import GuestLayout from './layouts/GuestLayout';
import Consultedocuments from './pages/Consultedocuments';
import Creationdocuments from './pages/Creationdocuments';
import Acceuil from './pages/Acceuil';
import AdminLayout from './layouts/AdminLayout';
import ConsulteFolders from './pages/ConsulteFolders';
import GestionUtilisateurs from './pages/GestionUtilisateurs';
import HierarchieVue from './pages/HierarchieVue';
import FluxTravail from './pages/FluxTravail';
import HistoriqueVue from './pages/HistoriqueVue';
import { getToken } from './services/apiConnection';

// Private Route component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!getToken();
  return isAuthenticated ? children : <Navigate to='/login' replace />;
};

// Admin Route component (extends PrivateRoute with role check)
const AdminRoute = ({ children }) => {
  return getToken() === 'admin' ? (
    <PrivateRoute>{children}</PrivateRoute>
  ) : (
    <Navigate to='/login' replace />
  );
};

const UserRoute = ({ children }) => {
  return getToken() === 'user' ? (
    <PrivateRoute>{children}</PrivateRoute>
  ) : (
    <Navigate to='/login' replace />
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <GuestLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
    ],
  },
  {
    path: '/u',
    element: (
      <UserRoute>
        <UserLayout />
      </UserRoute>
    ),
    children: [
      {
        path: 'list-docs',
        element: <Consultedocuments />,
      },
      {
        path: 'acceuil',
        element: <Acceuil />,
      },
      {
        path: 'upload-doc',
        element: <Creationdocuments />,
      },
    ],
  },
  {
    path: '/a',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        path: 'acceuil',
        element: <Acceuil />,
      },
      {
        path: 'upload-doc',
        element: <Creationdocuments />,
      },
      {
        path: 'consulte-docs',
        element: <ConsulteFolders />,
      },
      {
        path: 'tree-vue',
        element: <HierarchieVue />,
      },
      {
        path: 'user-management',
        element: <GestionUtilisateurs />,
      },
      {
        path: 'workflow-list',
        element: <FluxTravail />,
      },
      {
        path: 'history',
        element: <HistoriqueVue />,
      },
    ],
  },
  // Fallback route for unmatched paths
  {
    path: '*',
    element: <Navigate to='/login' replace />,
  },
]);

export default router;
