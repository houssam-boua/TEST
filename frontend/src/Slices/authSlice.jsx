import { createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,
};

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
      const { token, data } = action.payload;
      state.user = data;
      state.token = token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // Store token in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data));
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      // Remove from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    // Update user profile
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },

    // Initialize auth state from localStorage
    initializeAuth: (state) => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        state.token = token;
        state.user = JSON.parse(user);
        state.isAuthenticated = true;
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
          const { token, data } = action.payload;
          state.user = data;
          state.token = token;
          state.isAuthenticated = true;
          state.isLoading = false;
          state.error = null;

          // Store in localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(data));
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
