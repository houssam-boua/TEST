import React from "react";
import { useAuth } from "../Hooks/useAuth";
import AdminAccueil from "./AdminAccueil";
import UserDashboard from "./UserDashboard";
import LoadingScreen from "../Screens/LoadingScreen"; // Ensure this path matches your structure

const DashboardPage = () => {
  const { roleName, isAdmin, isLoading } = useAuth();

  // 1. Wait for auth data to load before deciding
  if (isLoading) {
    return <LoadingScreen />;
  }

  // 2. Check explicitly for 'admin' role (case-insensitive) OR the isAdmin boolean
  const isUserAdmin = isAdmin || (roleName && roleName.toLowerCase() === "admin");

  // 3. Render appropriate dashboard
  if (isUserAdmin) {
    return <AdminAccueil />;
  }

  return <UserDashboard />;
};

export default DashboardPage;