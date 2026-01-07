import AdminLayout from "../Layout/AdminLayout";
import PublicLayout from "../Layout/PublicLayout";
import UserLayout from "../Layout/UserLayout";
import ValidatorLayout from "../Layout/ValidatorLayout";

// Pages
import DashboardPage from "../Pages/DashboardPage";
import ActivityHistory from "../Pages/ActivityHistory";
import AdminDepartements from "../Pages/AdminDepartements";
import AdminPermissions from "../Pages/AdminPermissions";
import AdminRoles from "../Pages/AdminRoles";
import AdminUsers from "../Pages/AdminUsers";
import ConsulteFoldersManager from "../Pages/ConsulteFoldersManager";
import ConsulteTaks from "../Pages/ConsulteTaks";
import ConsulteWorkflow from "../Pages/ConsulteWorkflow";
import CreateDocument from "../Pages/CreateDocument";
import CreateDocumentsBatch from "../Pages/CreateDocumentsBatch";
import CreateWorkflow from "../Pages/CreateWorkflow";
import WorkflowDetailsPage from "../Pages/WorkflowDetails";
import EditDocument from "../Pages/EditDocument";
import LoginPage from "../Pages/LoginPage";
import PermissionGroups from "../Pages/PermissionGroups";
import UnauthorizedPage from "../Pages/UnauthorizedPage";
import ArchivedDocumentsPage from "../Pages/ArchivedDocumentsPage";
import AdminMetadata from "../Pages/AdminMetadata";
import MyTasks from "../Pages/MyTasks";
import TaskDetails from "../Pages/TaskDetails";

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
    // Allow all roles into the main layout
    requiredRoles: ["admin", "author", "approver", "reviewer", "publisher", "validator"], 
    routes: [
      // ==================== DASHBOARD ====================
      {
        path: "/acceuil",
        component: DashboardPage,
        breadcrumb: "Dashboard",
      },

      // ==================== DOCUMENTS ====================
      { 
        path: "/consulter", 
        component: ConsulteFoldersManager,
        breadcrumb: "Documents"
      },
      { 
        path: "/consulter/:folderId", 
        component: ConsulteFoldersManager,
        breadcrumb: "Documents"
      },
      { 
        path: "/creer-documents", 
        component: CreateDocumentsBatch,
        breadcrumb: "Create Documents"
      },
      { 
        path: "/edit-document/:id", 
        component: EditDocument,
        breadcrumb: "Edit Document"
      },
      { 
        path: "/archived-documents", 
        component: ArchivedDocumentsPage, 
        breadcrumb: "Archived Documents",
        requiredRoles: ["admin"] // ✅ Restrict to Admin only
      },

      // ==================== WORKFLOW ROUTES ====================
      { 
        path: "/consulter-workflow", 
        component: ConsulteWorkflow,
        breadcrumb: "All Workflows",
        requiredRoles: ["admin"]
      },
      { 
        path: "/workflows/:id",
        component: WorkflowDetailsPage,
        breadcrumb: "Workflow Details"
      },
      {
        path: "/consulter-workflow/:workflowId/tasks",
        component: ConsulteTaks,
        breadcrumb: "Workflow Tasks"
      },
      {
        path: "/my-tasks", 
        component: MyTasks,
        breadcrumb: "My Tasks"
      },
       {
        path: "/tasks/:taskId", 
        component: TaskDetails,
        breadcrumb: "Task Details"
      },
      {
        path: "/creer-workflow",
        component: CreateWorkflow,
        breadcrumb: "Create Workflow",
        requiredRoles: ["admin"]
      },

      // ==================== ADMIN SETTINGS ====================
      { 
        path: "/users", 
        component: AdminUsers,
        breadcrumb: "Users",
        requiredRoles: ["admin"]
      },
      { 
        path: "/departments", 
        component: AdminDepartements,
        breadcrumb: "Departments",
        requiredRoles: ["admin"]
      },
      { 
        path: "/roles", 
        component: AdminRoles,
        breadcrumb: "Roles",
        requiredRoles: ["admin"]
      },
      { 
        path: "/metadata", 
        component: AdminMetadata,
        breadcrumb: "Metadata (Sites & Types)",
        requiredRoles: ["admin"]
      },
      { 
        path: "/permissions", 
        component: AdminPermissions,
        breadcrumb: "Permissions",
        requiredRoles: ["admin"]
      },
      { 
        path: "/permission-groups", 
        component: PermissionGroups,
        breadcrumb: "Permission Groups",
        requiredRoles: ["admin"]
      },

      // ==================== HISTORY ====================
      {
        path: "/activity-history",
        component: ActivityHistory,
        breadcrumb: "Activity History",
        requiredRoles: ["admin"]
      },
    ],
  },

  validator: {
    layout: ValidatorLayout,
    requiredRoles: ["validator"],
    routes: [{ path: "/validate", component: "ValidatorPage" }],
  },
};