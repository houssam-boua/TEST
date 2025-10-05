import AdminLayout from "../Layout/AdminLayout";
import PublicLayout from "../Layout/PublicLayout";
import UserLayout from "../Layout/UserLayout";
import ValidatorLayout from "../Layout/ValidatorLayout";
import LoginPage from "../Pages/LoginPage";

export const routesConfig = {
  public: {
    layout: PublicLayout,
    routes: [
      { path: "/login", component: LoginPage },
      
    ],
  },

  user: {
    layout: UserLayout,
    routes: [{ path: "/login", component: "LoginPage" }],
  },

  admin: {
    layout: AdminLayout,
    requiredRoles: ["admin"],
    routes: [{ path: "/admin", component: "AdminPage" }],
  },

  validator: {
    layout: ValidatorLayout,
    requiredRoles: ["validator"],
    routes: [{ path: "/validate", component: "ValidatorPage" }],
  },
};