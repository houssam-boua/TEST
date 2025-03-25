import { createBrowserRouter, Navigate, Route } from 'react-router-dom';
import Login from './pages/Login';
import React from 'react';
import UserLayout from './layouts/UserLayout';
import GuestLayout from './layouts/GuestLayout';
import Consultedocuments from './pages/Consultedocuments';
import Creationdocuments from './pages/Creationdocuments';
import Acceuil from './pages/Acceuil';
import AdminLayout from './layouts/AdminLayout';

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
        path: "acceuil",
        element: <Acceuil/>
      },
      {
        path: "upload-doc",
        element: <Creationdocuments/>
      }
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
    ]
  }
]);

export default router;
