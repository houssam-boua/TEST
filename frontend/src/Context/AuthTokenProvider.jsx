import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  selectUserRole,
  selectUserDepartment,
  clearError,
  initializeAuth,
  logout,
  setLoading,
} from "../Slices/authSlice";
import { useLoginMutation } from "../Slices/apiSlice";
import { AuthContext } from "./AuthContextDefinition";

const AuthTokenProvider = ({ children }) => {
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const userRole = useSelector(selectUserRole);
  const userDepartment = useSelector(selectUserDepartment);

  const [loginMutation, { isLoading: loginLoading }] = useLoginMutation();

  // Initialize from storage
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Basic token validation against a protected endpoint
  useEffect(() => {
    const validate = async () => {
      if (!token || !isAuthenticated) return;
      dispatch(setLoading(true));
      try {
        const base =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${base}/api/users/`, {
          method: "HEAD",
          headers: { Authorization: `Token ${token}` },
        });
        if (res.status === 401) dispatch(logout());
      } catch (_) {
        // network error: ignore
      } finally {
        dispatch(setLoading(false));
      }
    };
    validate();
  }, [token, isAuthenticated, dispatch]);

  const login = async (credentials) => {
    dispatch(setLoading(true));
    try {
      const result = await loginMutation(credentials).unwrap();
      // Backend shape: { success, message, token, data }
      return {
        success: !!result?.success,
        token: result?.token,
        user: result?.data,
        message: result?.message || "Login successful",
      };
    } catch (err) {
      return {
        success: false,
        error: err?.data?.error || err?.error || "Login failed",
      };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logoutUser = () => dispatch(logout());
  const clearAuthError = () => dispatch(clearError());

  // Helpers
  const hasRole = (required) => {
    if (!userRole) return false;
    const list = Array.isArray(required) ? required : [required];
    return list.some(
      (r) => userRole.role_name?.toLowerCase() === String(r).toLowerCase()
    );
  };
  const belongsToDepartment = (dep) =>
    !!userDepartment &&
    userDepartment.dep_name?.toLowerCase() === String(dep).toLowerCase();
  const isAdmin = () =>
    user?.is_staff || user?.is_superuser || hasRole(["admin", "administrator"]);
  const ownsResource = (ownerId) => user?.id === ownerId;

  const getUserDisplayName = () => {
    if (!user) return "";
    if (user.first_name || user.last_name)
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return user.username || user.email || "";
  };
  const getUserInitials = () => {
    const n = getUserDisplayName();
    if (!n) return user?.username?.charAt(0)?.toUpperCase() || "U";
    const p = n.split(" ");
    return (p[0]?.charAt(0) + (p[1]?.charAt(0) || "")).toUpperCase();
  };

  const value = {
    // state
    user,
    token,
    isAuthenticated,
    loading: isLoading || loginLoading,
    error,

    // details
    userRole,
    userDepartment,

    // actions
    login,
    logout: logoutUser,
    clearError: clearAuthError,

    // helpers
    hasRole,
    belongsToDepartment,
    isAdmin,
    ownsResource,
    getUserDisplayName,
    getUserInitials,

    // convenience
    isStaff: !!user?.is_staff,
    isSuperuser: !!user?.is_superuser,
    userId: user?.id,
    username: user?.username,
    email: user?.email,
    firstName: user?.first_name,
    lastName: user?.last_name,
    roleName: userRole?.role_name,
    departmentName: userDepartment?.dep_name,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthTokenProvider;
