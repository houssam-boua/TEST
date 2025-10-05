import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./Slices/apiSlice";
import authReducer from "./Slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(apiSlice.middleware),
  devTools: import.meta.env.MODE !== "production",
});

export default store;
