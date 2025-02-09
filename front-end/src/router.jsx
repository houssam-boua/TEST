import { createBrowserRouter, Navigate, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";

import NotFound from "./pages/NotFound";
import { getToken } from "./api/api";
import NormCreate from "./components/Norms/forms/norm-create";
import NormsTable from "./components/Norms/table/norms-table";
import ExigencesTable from "./components/Exigences/table/exigences-table";
import ReglementTable from "./components/Reglement/table/reglements-table";
import ReglementCreate from "./components/Reglement/forms/reglement-create";
import ReglementUpdate from "./components/Reglement/forms/reglement-update";
import UserCreation from "./components/Accounts/forms/user-create";
import UsersTable from "./components/Accounts/table/users-table";
import UserUpdate from "./components/Accounts/forms/user-update";
import NormUpdate from "./components/Norms/forms/norm-update";
import NormChapitreTable from "./components/NormChapitre/table/norm-chapitre-table";
import Profile from "./components/Profile/profile-component";
import ApplicabiliteReglement from "./components/Applicabilite/table/applicabilite-table-reglement";
import ReglementsOverview from "./components/Reglement/table/reglements-overview";
import ExigenceCreate from "./components/Exigences/forms/exigence-create";
import ApplicabiliteOverview from "./components/Applicabilite/table/applicabilite-overview";
import ConfirmPassword from "./components/common/ConfirmPassword";
import RolesTable from "./components/Roles/table/roles-table";
import PermissionsShow from "./components/Permissions/tablec/permissions-table";
import PermissionsAdminShow from "./components/Permissions/tablec/permission-table-admin";
import PermissionsViewerShow from "./components/Permissions/tablec/permission-table-viewer";
import ConformiteOverview from "./components/Conformite/table/conformite-overview";
import ActionTable from "./components/Actions/table/action-overview";
import ActionReglementTable from "./components/Actions/table/action-table-reglement";
import ConformiteReglementTable from "./components/Conformite/table/conformite-table-reglement";
import MessagesTable from "./components/Chat/table/messages-table";
import MessageCreate from "./components/Chat/form/message-create";

// Route guards
const PrivateRoute = ({ element }) => {
  const isAuthenticated = !!getToken();
  return isAuthenticated ? element : <Navigate to="/signin" replace />;
};

const RedirectIfAuthenticated = ({ element }) => {
  const isAuthenticated = !!getToken();
  return isAuthenticated ? <Navigate to="/" replace /> : element;
};

// Router configuration
const router = createBrowserRouter([
  {
    path: "/signin",
    element: <RedirectIfAuthenticated element={<Login />} />,
  },
  {
    path: "/",
    element: <PrivateRoute element={<Home />} />,
    children: [
      { path: "users/list", element: <UsersTable /> },
      { path: "users/create", element: <UserCreation /> },
      { path: "users/edit/:userId", element: <UserUpdate /> }, // Dynamic userId
      { path: "reglements", element: <ReglementsOverview /> },
      { path: "reglements/list/:adminstratif", element: <ReglementTable /> }, // Dynamic adminstratif
      { path: "reglements/create", element: <ReglementCreate /> },
      { path: "reglements/edit/:id", element: <ReglementUpdate /> }, // Dynamic reglement ID

      { path: "exigences/create", element: <ExigenceCreate /> },
      {
        path: "exigences/reglement/:reglementid/:adminstratif",
        element: <ExigencesTable />,
      }, // Dynamic reglementid
      { path: "norms", element: <NormsTable /> },
      { path: "norms/create", element: <NormCreate /> },
      { path: "norms/edit/:normId", element: <NormUpdate /> }, // Dynamic normId
      { path: "norms/chapitres/:normId", element: <NormChapitreTable /> }, // Dynamic normId
      { path: "norms/exigences/:normid", element: <ExigencesTable /> }, // Dynamic normid
      { path: "profile/:userId", element: <Profile /> }, // Dynamic userId
      { path: "applicabilite", element: <ApplicabiliteOverview /> },
      {
        path: "applicabilite/reglement/:reglementId/admin/:adminstratif",
        element: <ApplicabiliteReglement />,
      }, // Dynamic reglementId
      {
        path: "conformite/create/:adminstratifId",
        element: <ConformiteReglementTable />,
      }, // Dynamic adminstratifId
      { path: "conformite", element: <ConformiteOverview /> },
      { path: "actions", element: <ActionTable /> },
      {
        path: "actions/administratif/:administratif",
        element: <ActionReglementTable />,
      },
      { path: "roles", element: <RolesTable /> },
      { path: "permissions", element: <PermissionsShow /> },
      { path: "permissions/admin", element: <PermissionsAdminShow /> },
      { path: "permissions/viewer", element: <PermissionsViewerShow /> },
      { path: "messages", element: <MessagesTable /> },
      { path: "messages/inbox", element: <MessageCreate /> },
    ].map((route) => ({
      ...route,
      element: <PrivateRoute element={route.element} />,
    })),
  },
  {
    path: "/confirm-password/:id", // Dynamic ID for password confirmation
    element: <ConfirmPassword />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
