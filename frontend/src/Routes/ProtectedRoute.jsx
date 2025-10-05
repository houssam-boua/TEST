import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import LoadingScreen from "../Screens/LoadingScreen";
import { AuthContext } from "../Context/AuthContextDefinition";

const ProtectedRoute = ({
  requiredRoles = [],
  children,
  redirectPath = "/login",
}) => {
  const { isAuthenticated, loading, hasRole } = useContext(AuthContext) || {};

  // Show loading indicator while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // If roles specified and user doesn't have permission
  const lacksRequiredRole =
    requiredRoles.length > 0 &&
    (typeof hasRole !== "function" || !hasRole(requiredRoles));

  if (lacksRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized - render the layout
  return children;
};

export default ProtectedRoute;
