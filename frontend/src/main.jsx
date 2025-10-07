import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import store from "./store";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { ThemeProvider } from "./Components/theme-provider";
import AuthTokenProvider from "./Context/AuthTokenProvider";
import { initializeAuth } from "./Slices/authSlice";

// Initialize auth state from localStorage on app start
store.dispatch(initializeAuth());
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // Cache data for 1 minute
      cacheTime: 900000, // Keep unused data for 15 minutes
      refetchOnWindowFocus: false, // Disable refetching on window focus
      retry: 1, // Retry failed queries once
    },
  },
});

const App = (
  <Provider store={store}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthTokenProvider>
          <RouterProvider router={router} />
        </AuthTokenProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </Provider>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  import.meta.env.DEV ? <React.StrictMode>{App}</React.StrictMode> : App
);
