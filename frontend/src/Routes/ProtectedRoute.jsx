import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import LoadingScreen from "../Screens/LoadingScreen";
import { AuthContext } from "../Context/AuthContextDefinition";
import { useRef } from "react";

const ProtectedRoute = ({
  requiredRoles = [],
  requiredPermissions = [],
  children,
  redirectPath = "/login",
}) => {
  const { isAuthenticated, loading, hasRole, hasPermission, isAdmin } =
    useContext(AuthContext) || {};

  const hasShownRef = useRef(false);

  // Show loading indicator while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Role check
  const lacksRequiredRole =
    requiredRoles.length > 0 &&
    (typeof hasRole !== "function" || !hasRole(requiredRoles));

  if (lacksRequiredRole) {
    // show a simple popup once, then redirect
    if (!hasShownRef.current) {
      hasShownRef.current = true;
      window.alert("You don't have permission to access this page.");
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // Permission check (admins bypass)
  const lacksRequiredPermission =
    requiredPermissions.length > 0 &&
    !(
      isAdmin?.() ||
      (typeof hasPermission === "function" &&
        hasPermission(requiredPermissions))
    );

  if (lacksRequiredPermission) {
    if (!hasShownRef.current) {
      hasShownRef.current = true;
      window.alert("You don't have permission to access this page.");
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized - render the layout
  return children;
};

export default ProtectedRoute;
