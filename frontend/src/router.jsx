import { createBrowserRouter, Navigate, Route } from 'react-router-dom';
import Login from './pages/Login';
import React from 'react';
import UserLayout from './layouts/UserLayout';
import GuestLayout from './layouts/GuestLayout';
import Consultedocuments from './pages/Consultedocuments';
import Uploadocuments from './pages/Uploadocuments';

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
        element: <div>Acceuil</div>
      },
      {
        path: "upload-doc",
        element: <Uploadocuments/>
      }
    ],
  },
]);

export default router;
