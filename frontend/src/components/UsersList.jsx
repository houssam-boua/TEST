import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../Slices/apiSlice";
import { selectIsAuthenticated } from "../Slices/authSlice";
import { Button } from "../components/ui/button";

const UsersList = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [searchParams, setSearchParams] = useState({});

  // API hooks
  const {
    data: users,
    error,
    isLoading,
    refetch,
  } = useGetUsersQuery(searchParams, {
    skip: !isAuthenticated, // Skip query if not authenticated
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Example functions for CRUD operations
  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData).unwrap();
      console.log("User created successfully");
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleUpdateUser = async (id, userData) => {
    try {
      await updateUser({ id, ...userData }).unwrap();
      console.log("User updated successfully");
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id).unwrap();
        console.log("User deleted successfully");
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const params = {};

    // Build search parameters
    for (const [key, value] of formData.entries()) {
      if (value.trim()) {
        params[key] = value.trim();
      }
    }

    setSearchParams(params);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please log in to view users.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading users: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Users Management</h2>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            name="username"
            placeholder="Search by username"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="email"
            placeholder="Search by email"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="first_name"
            placeholder="Search by first name"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.results?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role?.role_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.departement?.dep_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button
                    onClick={() =>
                      handleUpdateUser(user.id, {
                        /* updated data */
                      })
                    }
                    disabled={isUpdating}
                    variant="outline"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={isDeleting}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users?.results?.length === 0 && (
          <p className="text-center py-4 text-gray-500">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default UsersList;
