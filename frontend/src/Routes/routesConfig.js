import AdminLayout from "../Layout/AdminLayout";
import PublicLayout from "../Layout/PublicLayout";
import UserLayout from "../Layout/UserLayout";
import ValidatorLayout from "../Layout/ValidatorLayout";
import ActivityHistory from "../Pages/ActivityHistory";
import AdminAccueil from "../Pages/AdminAccueil";
import AdminDepartements from "../Pages/AdminDepartements";
import AdminPermissions from "../Pages/AdminPermissions";
import AdminRoles from "../Pages/AdminRoles";
import AdminUsers from "../Pages/AdminUsers";
import ConsulteDocuments from "../Pages/ConsulteDocuments";
import ConsulteFolders from "../Pages/ConsulteFolders";
import ConsulteTaks from "../Pages/ConsulteTaks";
import ConsulteWorkflow from "../Pages/ConsulteWorkflow";
import CreateDocument from "../Pages/CreateDocument";
import CreateDocumentsBatch from "../Pages/CreateDocumentsBatch";
import CreateWorkflow from "../Pages/CreateWorkflow";
import LoginPage from "../Pages/LoginPage";
import PermissionGroups from "../Pages/PermissionGroups";
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
      {
        path: "/a/acceuil",
        component: AdminAccueil,
        breadcrumb: "Accuefgbdil",
      },
      { path: "/a/consulter", component: ConsulteFolders },
      {
        path: "/a/consulter/:folderId/documents/",
        component: ConsulteDocuments,
      },
      { path: "/a/creer-documents", component: CreateDocumentsBatch },
      { path: "/a/consulter-workflow", component: ConsulteWorkflow },
      {
        path: "/a/consulter-workflow/:workflowId/tasks",
        component: ConsulteTaks,
      },
      { path: "/a/creer-workflow", component: CreateWorkflow },
      { path: "/a/users", component: AdminUsers },
      { path: "/a/departments", component: AdminDepartements },
      { path: "/a/roles", component: AdminRoles },
      {
        path: "/a/activity-history",
        component: ActivityHistory,
        breadcrumb: "Historic activity",
      },
      { path: "/a/permissions", component: AdminPermissions },
      { path: "/a/permission-groups", component: PermissionGroups },
    ],
  },

  validator: {
    layout: ValidatorLayout,
    requiredRoles: ["validator"],
    routes: [{ path: "/validate", component: "ValidatorPage" }],
  },
};
