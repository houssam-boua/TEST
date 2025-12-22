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
// import ConsulteDocuments from "../Pages/ConsulteDocuments";
// import ConsulteFolders from "../Pages/ConsulteFolders";
import ConsulteFoldersManager from "../Pages/ConsulteFoldersManager";
import ConsulteTaks from "../Pages/ConsulteTaks";
import ConsulteWorkflow from "../Pages/ConsulteWorkflow";
import CreateDocument from "../Pages/CreateDocument";
import CreateDocumentsBatch from "../Pages/CreateDocumentsBatch";
import CreateWorkflow from "../Pages/CreateWorkflow";
import EditDocument from "../Pages/EditDocument";
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
    requiredRoles: ["admin", "validator", "user"],
    routes: [
      {
        path: "/acceuil",
        component: AdminAccueil,
        breadcrumb: "Dashboard",
      },
      { path: "/consulter", component: ConsulteFoldersManager },
      { path: "/consulter/:folderId", component: ConsulteFoldersManager },
      // {
      //   path: "/consulter/:folderId/documents/",
      //   component: ConsulteDocuments,
      // },
      { path: "/creer-documents", component: CreateDocumentsBatch },
      { path: "/consulter-workflow", component: ConsulteWorkflow },
      {
        path: "/consulter-workflow/:workflowId/tasks",
        component: ConsulteTaks,
      },
      {
        path: "/creer-workflow",
        component: CreateWorkflow,
        breadcrumb: "Create Workflow",
      },
      { path: "/edit-document/:id", component: EditDocument },
      { path: "/users", component: AdminUsers },
      { path: "/departments", component: AdminDepartements },
      { path: "/roles", component: AdminRoles },
      {
        path: "/activity-history",
        component: ActivityHistory,
        breadcrumb: "Historic activity",
      },
      { path: "/permissions", component: AdminPermissions },
      { path: "/permission-groups", component: PermissionGroups },
    ],
  },

  validator: {
    layout: ValidatorLayout,
    requiredRoles: ["validator"],
    routes: [{ path: "/validate", component: "ValidatorPage" }],
  },
};
