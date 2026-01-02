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
  loginSuccess,
} from "../slices/authSlice";
import { useLoginMutation, apiSlice } from "../slices/apiSlice";
import { AuthContext } from "./AuthContextDefinition";

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  // Selectors from auth slice
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const userRole = useSelector(selectUserRole);
  const userDepartment = useSelector(selectUserDepartment);

  // RTKQ login mutation (only endpoint kept in apiSlice)
  const [loginMutation, { isLoading: loginLoading }] = useLoginMutation();

  // Initialize auth from localStorage once
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Very light token validation against a protected endpoint
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !isAuthenticated) return;
      dispatch(setLoading(true));
      try {
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/users/`, {
          method: "HEAD",
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        if (res.status === 401) {
          // Invalid token -> logout locally
          dispatch(logout());
        }
      } catch {
        // Network error: don't logout automatically
        // You can surface a toast here if desired
        // console.error("Token validation error", e);
      } finally {
        dispatch(setLoading(false));
      }
    };

    validateToken();
  }, [token, isAuthenticated, dispatch]);

  // Login using RTK Query (authSlice extraReducers will persist token+user)
  const login = async (credentials) => {
    dispatch(setLoading(true));
    try {
      // Option A: server returns token; fetch /api/me/ to get canonical user+permissions
      const loginResult = await loginMutation(credentials).unwrap();
      const token = loginResult?.token ?? loginResult;

      if (!token) {
        return { success: false, error: "Login did not return a token" };
      }

      // Store token temporarily so the next request includes it in headers
      dispatch(loginSuccess({ token, data: null }));

      // fetch canonical user (force refetch to avoid stale cached user)
      const meAction = apiSlice.endpoints.getMe.initiate(undefined, {
        forceRefetch: true,
      });
      const meResult = await dispatch(meAction);
      const meData = meResult?.data ?? null;

      // persist full auth (token + user)
      dispatch(loginSuccess({ token, data: meData }));

      // return normalized shape
      return {
        success: true,
        token,
        user: meData,
        message: "Login successful",
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

  const logoutUser = () => {
    // Server has a logout endpoint, but apiSlice no longer exports it. Local logout is fine.
    // Clear auth state and also reset RTK Query cache to avoid serving stale data
    dispatch(logout());
    try {
      // resetApiState clears RTK Query cache and subscriptions
      dispatch(apiSlice.util.resetApiState());
    } catch {
      // ignore errors during reset
    }
  };

  const clearAuthError = () => dispatch(clearError());

  // Helpers
  const hasRole = (required) => {
    if (!userRole) return false;
    const requiredList = Array.isArray(required) ? required : [required];
    return requiredList.some(
      (r) => userRole.role_name?.toLowerCase() === String(r).toLowerCase()
    );
  };

  const belongsToDepartment = (dep) => {
    if (!userDepartment || !dep) return false;
    return userDepartment.dep_name?.toLowerCase() === String(dep).toLowerCase();
  };

  const isAdmin = () =>
    user?.is_staff || user?.is_superuser || hasRole(["admin", "administrator"]);

  const ownsResource = (ownerId) => user?.id === ownerId;

  // Permission helper: supports string or array, mode "any" (default) or "all"
  const hasPermission = (required, mode = "any") => {
    if (isAdmin()) return true;
    const perms = user?.permissions || user?.user_permissions || [];
    const list = Array.isArray(required)
      ? required.filter(Boolean)
      : [required].filter(Boolean);
    if (list.length === 0) return true;
    if (mode === "all") return list.every((p) => perms.includes(p));
    return list.some((p) => perms.includes(p));
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    if (user.first_name || user.last_name)
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return user.username || user.email || "";
  };

  const getUserInitials = () => {
    const n = getUserDisplayName();
    if (!n) return user?.username?.charAt(0)?.toUpperCase() || "U";
    const parts = n.split(" ");
    return (parts[0]?.charAt(0) + (parts[1]?.charAt(0) || "")).toUpperCase();
  };

  const contextValue = {
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
    hasPermission,
    belongsToDepartment,
    isAdmin,
    ownsResource,
    getUserDisplayName,
    getUserInitials,

    // raw permission list for convenience
    permissions: user?.permissions || user?.user_permissions || [],

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

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Default export for compatibility with AuthTokenProvider alias
export default AuthProvider;
