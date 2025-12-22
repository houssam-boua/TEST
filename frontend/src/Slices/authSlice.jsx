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

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;

// Thunk for initializing auth on app startup
export const initializeAuthAsync = () => (dispatch) => {
  dispatch(initializeAuth());
};

// Helper function to get user role
export const selectUserRole = (state) => state.auth.user?.role;

// Helper function to get user department
export const selectUserDepartment = (state) => state.auth.user?.departement;

// Helper function to check if user has specific role
export const selectHasRole = (roleName) => (state) =>
  state.auth.user?.role?.role_name === roleName;

// Helper function to check if user belongs to specific department
export const selectBelongsToDepartment = (departmentName) => (state) =>
  state.auth.user?.departement?.dep_name === departmentName;

export default authSlice.reducer;
