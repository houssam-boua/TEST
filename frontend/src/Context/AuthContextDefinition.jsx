import { createContext } from "react";

// Separate definition to avoid Fast Refresh warnings when exporting hooks/components
export const AuthContext = createContext(null);
