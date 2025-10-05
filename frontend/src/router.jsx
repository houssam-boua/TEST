import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routesConfig } from "./Routes/routesConfig";
import ProtectedRoute from "./Routes/ProtectedRoute";

const router = createBrowserRouter([
  {
    element: <routesConfig.public.layout />,
    children: routesConfig.public.routes.map((route) => ({
      path: route.path,
      element: <route.component />,
    })),
  },

  {
    element: (
      <ProtectedRoute requiredRoles={routesConfig.admin.requiredRoles}>
        <routesConfig.admin.layout />
      </ProtectedRoute>
    ),
    children: routesConfig.admin.routes.map((route) => ({
      path: route.path,
      element: <route.component />,
    })),
  },
]);

export default router;
