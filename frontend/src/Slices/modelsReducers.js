import { createSlice } from "@reduxjs/toolkit";

// Generic pattern for small client-side reducers per model. These are
// intentionally lightweight: store items array, current selection, and
// provide basic setters. The RTK Query endpoints remain the source of truth
// for server data; these reducers are for local UI state and caching needs.

function makeSlice(name) {
  return createSlice({
    name,
    initialState: {
      items: [],
      current: null,
      loading: false,
      error: null,
    },
    reducers: {
      setItems(state, action) {
        state.items = Array.isArray(action.payload) ? action.payload : [];
      },
      addItem(state, action) {
        state.items = state.items.concat(action.payload);
      },
      updateItem(state, action) {
        const payload = action.payload || {};
        state.items = state.items.map((it) =>
          it.id === payload.id ? { ...it, ...payload } : it
        );
      },
      removeItem(state, action) {
        const id = action.payload;
        state.items = state.items.filter((it) => it.id !== id);
      },
      setCurrent(state, action) {
        state.current = action.payload ?? null;
      },
      setLoading(state, action) {
        state.loading = !!action.payload;
      },
      setError(state, action) {
        state.error = action.payload ?? null;
      },
      clear(state) {
        state.items = [];
        state.current = null;
        state.loading = false;
        state.error = null;
      },
    },
  });
}

export const rolesModel = makeSlice("rolesModel");
export const departementModel = makeSlice("departementModel");
export const documentModel = makeSlice("documentModel");
export const logsModel = makeSlice("logsModel");
export const permissionModel = makeSlice("permissionModel");
export const taskModel = makeSlice("taskModel");
export const userModel = makeSlice("userModel");
export const workflowModel = makeSlice("workflowModel");

export const {
  setItems: setRoles,
  addItem: addRole,
  updateItem: updateRole,
  removeItem: removeRole,
  setCurrent: setCurrentRole,
} = rolesModel.actions;

export const {
  setItems: setDepartements,
  addItem: addDepartement,
  updateItem: updateDepartement,
  removeItem: removeDepartement,
  setCurrent: setCurrentDepartement,
} = departementModel.actions;

export const {
  setItems: setDocuments,
  addItem: addDocumentLocal,
  updateItem: updateDocumentLocal,
  removeItem: removeDocumentLocal,
  setCurrent: setCurrentDocument,
} = documentModel.actions;

export const {
  setItems: setLogs,
  addItem: addLog,
  updateItem: updateLog,
  removeItem: removeLog,
  setCurrent: setCurrentLog,
} = logsModel.actions;

export const {
  setItems: setPermissions,
  addItem: addPermission,
  updateItem: updatePermission,
  removeItem: removePermission,
  setCurrent: setCurrentPermission,
} = permissionModel.actions;

export const {
  setItems: setTasks,
  addItem: addTaskLocal,
  updateItem: updateTaskLocal,
  removeItem: removeTaskLocal,
  setCurrent: setCurrentTask,
} = taskModel.actions;

export const {
  setItems: setUsersLocal,
  addItem: addUserLocal,
  updateItem: updateUserLocal,
  removeItem: removeUserLocal,
  setCurrent: setCurrentUserLocal,
} = userModel.actions;

export const {
  setItems: setWorkflows,
  addItem: addWorkflowLocal,
  updateItem: updateWorkflowLocal,
  removeItem: removeWorkflowLocal,
  setCurrent: setCurrentWorkflow,
} = workflowModel.actions;

// Export reducers to be consumed by the store
export const reducers = {
  roles: rolesModel.reducer,
  departements: departementModel.reducer,
  documents: documentModel.reducer,
  logs: logsModel.reducer,
  permissions: permissionModel.reducer,
  tasks: taskModel.reducer,
  users: userModel.reducer,
  workflows: workflowModel.reducer,
};

// Default export keeps compatibility in case someone imports the module default
export default reducers;
