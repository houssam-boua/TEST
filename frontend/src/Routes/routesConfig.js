import AdminLayout from "../Layout/AdminLayout";
import PublicLayout from "../Layout/PublicLayout";
import UserLayout from "../Layout/UserLayout";
import ValidatorLayout from "../Layout/ValidatorLayout";
import AdminAccueil from "../Pages/AdminAccueil";
import ConsulteDocuments from "../Pages/ConsulteDocuments";
import LoginPage from "../Pages/LoginPage";
import UnauthorizedPage from "../Pages/UnauthorizedPage";

export const routesConfig = {
  public: {
    layout: PublicLayout,
    routes: [
      { path: "/login", component: LoginPage },
      { path: "/unauthorized", component: UnauthorizedPage },
    ],
  },

  user: {
    layout: UserLayout,
    routes: [{ path: "/login", component: "LoginPage" }],
  },

  admin: {
    layout: AdminLayout,
    requiredRoles: ["admin"],
    routes: [
      { path: "/a/acceuil", component: AdminAccueil },
      { path: "/a/consulter-document", component: ConsulteDocuments },
    ],
  },

  validator: {
    layout: ValidatorLayout,
    requiredRoles: ["validator"],
    routes: [{ path: "/validate", component: "ValidatorPage" }],
  },
};
