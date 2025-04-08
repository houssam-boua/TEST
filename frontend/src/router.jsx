import { createBrowserRouter, Navigate, Route } from 'react-router-dom';
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
// const PrivateRoute = ({element})=>{
//     return <Route element={element} />;
// }

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
    element: <UserLayout />,
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
    path: 'a',
    element: <AdminLayout />,
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
        element: <HistoriqueVue/>,
    }
    ],
  },
]);

export default router;
