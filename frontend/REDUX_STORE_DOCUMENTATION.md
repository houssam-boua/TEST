# Redux Store Documentation

This documentation explains how to use the Redux store with API and authentication slices for the Docarea application.

## Overview

The Redux store is configured with:

- **Auth Slice**: Manages authentication state and user data
- **API Slice**: Handles all API communications using RTK Query

## Setup

### 1. Environment Variables

Create a `.env` file in the frontend root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 2. Store Configuration

The store is already configured in `src/store.jsx` and connected to the app in `src/main.jsx`.

## Authentication Slice (`authSlice.jsx`)

### State Structure

```javascript
{
  user: null,              // User object from backend
  token: null,             // Authentication token
  isAuthenticated: false,  // Boolean authentication status
  isLoading: false,        // Loading state for auth operations
  error: null             // Error messages
}
```

### Usage Examples

#### Login

```javascript
import { useLoginMutation } from "../Slices/apiSlice";
import { useSelector } from "react-redux";
import { selectAuth } from "../Slices/authSlice";

const LoginComponent = () => {
  const [login, { isLoading }] = useLoginMutation();
  const { error } = useSelector(selectAuth);

  const handleLogin = async (credentials) => {
    try {
      await login(credentials).unwrap();
      // Success handling is automatic via authSlice
    } catch (error) {
      // Error handling is automatic via authSlice
    }
  };
};
```

#### Logout

```javascript
import { useLogoutMutation } from "../Slices/apiSlice";

const LogoutComponent = () => {
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      // Even if server logout fails, local state is cleared
    }
  };
};
```

#### Access User Data

```javascript
import { useSelector } from "react-redux";
import {
  selectUser,
  selectIsAuthenticated,
  selectUserRole,
} from "../Slices/authSlice";

const ProfileComponent = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <h1>
        Welcome, {user.first_name} {user.last_name}
      </h1>
      <p>Role: {userRole?.role_name}</p>
      <p>Department: {user.departement?.dep_name}</p>
    </div>
  );
};
```

## API Slice (`apiSlice.jsx`)

### Available Endpoints

#### Users Management

- `useGetUsersQuery(params)` - Get all users with optional filtering
- `useGetUserByIdQuery(id)` - Get specific user
- `useCreateUserMutation()` - Create new user
- `useUpdateUserMutation()` - Update existing user
- `useDeleteUserMutation()` - Delete user

#### Roles Management

- `useGetRolesQuery(params)` - Get all roles
- `useGetRoleByIdQuery(id)` - Get specific role
- `useCreateRoleMutation()` - Create new role
- `useUpdateRoleMutation()` - Update existing role
- `useDeleteRoleMutation()` - Delete role

#### Departments Management

- `useGetDepartementsQuery(params)` - Get all departments
- `useGetDepartementByIdQuery(id)` - Get specific department
- `useCreateDepartementMutation()` - Create new department
- `useUpdateDepartementMutation()` - Update existing department
- `useDeleteDepartementMutation()` - Delete department

#### Documents Management

- `useGetDocumentsQuery(params)` - Get all documents
- `useGetDocumentByIdQuery(id)` - Get specific document
- `useCreateDocumentMutation()` - Create new document (handles file uploads)
- `useUpdateDocumentMutation()` - Update existing document
- `useDeleteDocumentMutation()` - Delete document
- `useCreateFolderMutation()` - Create new folder

#### Workflows Management

- `useGetWorkflowsQuery(params)` - Get all workflows
- `useGetWorkflowByIdQuery(id)` - Get specific workflow
- `useCreateWorkflowMutation()` - Create new workflow
- `useUpdateWorkflowMutation()` - Update existing workflow
- `useDeleteWorkflowMutation()` - Delete workflow

#### Tasks Management

- `useGetTasksQuery(params)` - Get all tasks
- `useGetTaskByIdQuery(id)` - Get specific task
- `useCreateTaskMutation()` - Create new task
- `useUpdateTaskMutation()` - Update existing task
- `useDeleteTaskMutation()` - Delete task

### Usage Examples

#### Fetching Data

```javascript
import { useGetUsersQuery } from "../Slices/apiSlice";

const UsersComponent = () => {
  const {
    data: users,
    error,
    isLoading,
    refetch,
  } = useGetUsersQuery({
    username: "john", // Optional filter
    email: "john@example.com", // Optional filter
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {users?.results?.map((user) => (
        <div key={user.id}>{user.username}</div>
      ))}
    </div>
  );
};
```

#### Creating Data

```javascript
import { useCreateUserMutation } from "../Slices/apiSlice";

const CreateUserComponent = () => {
  const [createUser, { isLoading, error }] = useCreateUserMutation();

  const handleSubmit = async (userData) => {
    try {
      const newUser = await createUser(userData).unwrap();
      console.log("User created:", newUser);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };
};
```

#### Updating Data

```javascript
import { useUpdateUserMutation } from "../Slices/apiSlice";

const UpdateUserComponent = ({ userId }) => {
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const handleUpdate = async (updatedData) => {
    try {
      await updateUser({ id: userId, ...updatedData }).unwrap();
      console.log("User updated successfully");
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };
};
```

#### File Upload (Documents)

```javascript
import { useCreateDocumentMutation } from "../Slices/apiSlice";

const UploadDocumentComponent = () => {
  const [createDocument, { isLoading }] = useCreateDocumentMutation();

  const handleFileUpload = async (formData) => {
    try {
      const document = await createDocument({
        doc_title: "My Document",
        doc_type: "PDF",
        doc_category: "Reports",
        doc_description: "Important report",
        doc_path: formData.get("file"), // File object
        doc_owner: userId,
        doc_departement: departmentId,
        doc_status: "active",
        doc_size: file.size,
        doc_format: "pdf",
      }).unwrap();

      console.log("Document uploaded:", document);
    } catch (error) {
      console.error("Failed to upload document:", error);
    }
  };
};
```

## Advanced Features

### Automatic Token Management

- Tokens are automatically included in all authenticated requests
- Invalid tokens (401 responses) automatically trigger logout
- Token persistence in localStorage

### Data Caching and Invalidation

- RTK Query automatically caches data
- Cache is invalidated when related data changes
- Manual refetch available via `refetch()` function

### Error Handling

- Network errors are handled automatically
- Authentication errors trigger automatic logout
- Validation errors are returned in the hook's error state

### Background Sync

- Data automatically refetches when window regains focus
- Stale data is refetched based on cache settings

## Best Practices

1. **Always handle loading and error states** in your components
2. **Use selective queries** with `skip` parameter when data isn't needed
3. **Leverage RTK Query's caching** - don't fetch the same data multiple times
4. **Use proper TypeScript** for better development experience (convert to .ts files)
5. **Handle file uploads correctly** by using FormData
6. **Implement proper error boundaries** for graceful error handling

## Environment Setup

Make sure your Django backend is configured to:

1. Accept CORS requests from your frontend domain
2. Handle Token authentication properly
3. Return proper error responses (401 for unauthorized, etc.)
4. Handle file uploads with proper media settings
