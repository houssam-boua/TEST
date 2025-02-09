import React, { useState } from "react";

const PermissionsAdminShow = () => {
  // Initialize state to handle data
  const [permissionsData, setPermissionsData] = useState([
    {
      id: 1,
      name: "permissions.reglements",
      object: "com.crhsesorec.apps.reglements.db.*",
      read: 1,
      write: 1,
      create: 1,
      remove: 1,
    },
    {
      id: 2,
      name: "permissions.normes",
      object: "com.crhsesorec.apps.normes.db.*",
      read: 1,
      write: 1,
      create: 1,
      remove: 1,
    },
    {
      id: 3,
      name: "permissions.authentication",
      object: "com.crhsesorec.auth.db.*",
      read: 1,
      write: 1,
      create: 1,
      remove: 1,
    },
    {
      id: 4,
      name: "permissions.applicabilite",
      object: "com.crhsesorec.apps.applicabilite.db.*",
      read: 1,
      write: 0,
      create: 1,
      remove: 0,
    },
    {
      id: 5,
      name: "permissions.conformite",
      object: "com.crhsesorec.apps.conformite.db.*",
      read: 1,
      write: 0,
      create: 1,
      remove: 0,
    },
    {
      id: 6,
      name: "permissions.ation",
      object: "com.crhsesorec.apps.ation.db.*",
      read: 0,
      write: 0,
      create: 1,
      remove: 0,
    },
    {
      id: 7,
      name: "permissions.roles",
      object: "com.crhsesorec.apps.roles.db.*",
      read: 1,
      write: 1,
      create: 1,
      remove: 1,
    },
    {
      id: 8,
      name: "permissions.permissions",
      object: "com.crhsesorec.auth.permissions.db.*",
      read: 1,
      write: 1,
      create: 1,
      remove: 1,
    },
    {
      id: 9,
      name: "permissions.users",
      object: "com.crhsesorec.auth.users.db.*",
      read: 1,
      write: 1,
      create: 1,
      remove: 1,
    },
    {
      id: 10,
      name: "permissions.exigences",
      object: "com.crhsesorec.apps.exigences.db.*",
      read: 1,
      write: 1,
      create: 1,
      remove: 1,
    },
  ]);

  // Function to toggle permission flags
  const togglePermission = (id, field) => {
    setPermissionsData((prevData) =>
      prevData.map((permission) =>
        permission.id === id
          ? { ...permission, [field]: permission[field] ? 0 : 1 }
          : permission
      )
    );
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="table table-xs  w-full rounded-sm border border-base-300/20 border-l-0">
          <thead className="text-pretty text-base-content">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Object</th>
              <th>Read</th>
              <th>Write</th>
              <th>Create</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {permissionsData.map((permission) => (
              <tr key={permission.id} className="hover:bg-primary/10">
                <td>{permission.id}</td>
                <td>{permission.name}</td>
                <td>{permission.object}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!permission.read}
                    onChange={() => togglePermission(permission.id, "read")}
                    className="checkbox checkbox-primary border border-base-300/20 shadow-xs rounded-sm size-4"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!permission.write}
                    onChange={() => togglePermission(permission.id, "write")}
                    className="checkbox checkbox-primary border border-base-300/20 shadow-xs rounded-sm size-4"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!permission.create}
                    onChange={() => togglePermission(permission.id, "create")}
                    className="checkbox checkbox-primary border border-base-300/20 shadow-xs rounded-sm size-4"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!permission.remove}
                    onChange={() => togglePermission(permission.id, "remove")}
                    className="checkbox checkbox-primary border border-base-300/20 shadow-xs rounded-sm size-4"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionsAdminShow;
