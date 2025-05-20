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
import ProtectedRoute from './component/ProtectedRoute';
import ValidatorLayout from './layouts/ValidatorLayout'; // You may need to create this

const router = createBrowserRouter([
  {
    path: '/',
    element: <GuestLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        element: <Login />,
      },
    ],
  },
  {
    path: '/u',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <UserLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/u/acceuil" replace />,
      },
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
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/a/acceuil" replace />,
      },
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
  {
    path: '/v',
    element: (
      <ProtectedRoute allowedRoles={['validator']}>
        <ValidatorLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/v/acceuil" replace />,
      },
      {
        path: 'acceuil',
        element: <Acceuil />,
      },
      // Add more validator-specific routes here
    ],
  },
  // Fallback route for unmatched paths
  {
    path: '*',
    element: <Navigate to='/login' replace />,
  },
]);

export default router;