import AdminLayout from "../Layout/AdminLayout";
import PublicLayout from "../Layout/PublicLayout";
import UserLayout from "../Layout/UserLayout";
import ValidatorLayout from "../Layout/ValidatorLayout";
import AdminAccueil from "../Pages/AdminAccueil";
import ConsulteDocuments from "../Pages/ConsulteDocuments";
import ConsulteFolders from "../Pages/ConsulteFolders";
import ConsulteTaks from "../Pages/ConsulteTaks";
import ConsulteWorkflow from "../Pages/ConsulteWorkflow";
import CreateDocument from "../Pages/CreateDocument";
import CreateWorkflow from "../Pages/CreateWorkflow";
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
      { path: "/a/consulter", component: ConsulteFolders },
      {
        path: "/a/consulter/:folderId/documents/",
        component: ConsulteDocuments,
      },
      { path: "/a/creer-document", component: CreateDocument },

      { path: "/a/consulter-workflow", component: ConsulteWorkflow },
      {
        path: "/a/consulter-workflow/:workflowId/tasks",
        component: ConsulteTaks,
      },
      { path: "/a/creer-workflow", component: CreateWorkflow },
    ],
  },

  validator: {
    layout: ValidatorLayout,
    requiredRoles: ["validator"],
    routes: [{ path: "/validate", component: "ValidatorPage" }],
  },
};
