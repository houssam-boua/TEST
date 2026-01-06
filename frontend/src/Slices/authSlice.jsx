// slices/authSlice.jsx
import { createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";
import authStorage from "../lib/authStorage";

// Helper function to get initial state from storage (abstracted)
const getInitialState = () => {
  const token = authStorage.getToken();
  const user = authStorage.getUser();

  // Only consider authenticated if both token and user exist
  const isAuthenticated = !!(token && user);

  return {
    user,
    token,
    isAuthenticated,
    isLoading: false,
    error: null,
  };
};

// Initial state
const initialState = getInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Login success
    loginSuccess: (state, action) => {
      // support calling loginSuccess with either the full API response { token, data }
      // or with an object { token, data }.
      const token = action.payload?.token ?? action.payload;
      const data = action.payload?.data ?? action.payload?.data ?? state.user;
      state.user = data;
      state.token = token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // Persist token/user via authStorage abstraction
      authStorage.setAuth({ token, user: data });
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      // Remove persisted auth
      authStorage.clearAuth();
    },

    // Update user profile
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      authStorage.setUser(state.user);
    },

    // Initialize auth state from abstracted storage
    initializeAuth: (state) => {
      const token = authStorage.getToken();
      const user = authStorage.getUser();

      if (token && user) {
        state.token = token;
        state.user = user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      } else {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    },
  },
  extraReducers: (builder) => {
    const loginEp = apiSlice?.endpoints?.login;
    if (loginEp) {
      builder
        // Handle login mutation
        .addMatcher(loginEp.matchPending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addMatcher(loginEp.matchFulfilled, (state, action) => {
          // API response shape: { success, message, token, data }
          const token = action.payload?.token ?? null;
          const data = action.payload?.data ?? null;
          state.user = data;
          state.token = token;
          state.isAuthenticated = !!(token && data);
          state.isLoading = false;
          state.error = null;

          // Persist via authStorage abstraction
          if (token) authStorage.setToken(token);
          if (data) authStorage.setUser(data);
        })
        .addMatcher(loginEp.matchRejected, (state, action) => {
          state.isLoading = false;
          state.error =
            action.payload?.data?.error ||
            action.error?.message ||
            "Login failed";
        });
    }
  },
});

// Action creators
export const {
  setLoading,
  clearError,
  setError,
  loginSuccess,
  logout,
  updateUserProfile,
  initializeAuth,
} = authSlice.actions;

// ==================== SELECTORS ====================

// Basic selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectCurrentUser = (state) => state.auth.user; // ✅ ADDED
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;

// User profile selectors
export const selectUserId = (state) => state.auth.user?.id;
export const selectUsername = (state) => state.auth.user?.username;
export const selectUserEmail = (state) => state.auth.user?.email;
export const selectUserFirstName = (state) => state.auth.user?.first_name;
export const selectUserLastName = (state) => state.auth.user?.last_name;
export const selectUserFullName = (state) => {
  const user = state.auth.user;
  if (!user) return null;
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  return `${firstName} ${lastName}`.trim() || user.username || 'Unknown User';
};

// Role and permissions selectors
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserRoleName = (state) => state.auth.user?.role?.role_name;
export const selectUserDepartment = (state) => state.auth.user?.departement;
export const selectUserDepartmentName = (state) => state.auth.user?.departement?.dep_name;
export const selectUserPermissions = (state) => state.auth.user?.permissions || [];
export const selectUserGroups = (state) => state.auth.user?.groups || [];

// Admin check selectors
export const selectIsAdmin = (state) => 
  state.auth.user?.is_superuser || state.auth.user?.is_staff || false;
export const selectIsSuperuser = (state) => state.auth.user?.is_superuser || false;
export const selectIsStaff = (state) => state.auth.user?.is_staff || false;

// Helper function to check if user has specific role
export const selectHasRole = (roleName) => (state) =>
  state.auth.user?.role?.role_name === roleName;

// Helper function to check if user belongs to specific department
export const selectBelongsToDepartment = (departmentName) => (state) =>
  state.auth.user?.departement?.dep_name === departmentName;

// Helper function to check if user has specific permission
export const selectHasPermission = (permission) => (state) => {
  const permissions = state.auth.user?.permissions || [];
  return permissions.includes(permission);
};

// Helper function to check if user has any of the specified permissions
export const selectHasAnyPermission = (...permissions) => (state) => {
  const userPermissions = state.auth.user?.permissions || [];
  return permissions.some(perm => userPermissions.includes(perm));
};

// Helper function to check if user has all of the specified permissions
export const selectHasAllPermissions = (...permissions) => (state) => {
  const userPermissions = state.auth.user?.permissions || [];
  return permissions.every(perm => userPermissions.includes(perm));
};

// Helper function to check if user is in specific group
export const selectIsInGroup = (groupName) => (state) => {
  const groups = state.auth.user?.groups || [];
  return groups.includes(groupName);
};

// Thunk for initializing auth on app startup
export const initializeAuthAsync = () => (dispatch) => {
  dispatch(initializeAuth());
};

export default authSlice.reducer;
