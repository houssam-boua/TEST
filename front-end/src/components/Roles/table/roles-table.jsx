import React, { useCallback, useEffect, useState } from "react";
import TableHeader from "../../common/TableHeader";
import TableRow from "../../common/TableRow";
import { fetchRoles } from "../../../api/api";
import { Loading } from "../../common/Loading";
import ToolBar from "../../common/tool-bar";
import CreateRole from "../forms/role-create";

const RolesTable = () => {
  const [IsLoading, setIsLoading] = useState(false); // Add loading state for async actions
  const [selectedRoles, setSelectedRoles] = useState(new Set()); // To keep track of selected users
  const [roles, setRoles] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const openModal = () => setIsCreateModalOpen(true);
  const closeModal = () => setIsCreateModalOpen(false);

  useEffect(() => {
    const getRoles = async () => {
      try {
        setIsLoading(true);
        const rolesData = await fetchRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error("Error fetching roles data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getRoles();
  }, []);

  const handleSelectAllChange = useCallback(
    (e) => {
      const isChecked = e.target.checked;
      const allRolesIds = new Set(
        isChecked ? roles.map((role) => role.id) : []
      );
      selectedRoles(allRolesIds);
    },
    [roles]
  );

  const [searchTerms, setSearchTerms] = useState({
    roleName: "",
  });

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchTerms((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredRoles = roles.filter((role) => {
    return (role.role_name?.toLowerCase() || "").includes(
      searchTerms.roleName.toLowerCase()
    );
  });

  const handleCheckboxChange = useCallback((roleId) => {
    setSelectedRoles((prevState) => {
      const updated = new Set(prevState);
      if (updated.has(roleId)) {
        updated.delete(roleId);
      } else {
        updated.add(roleId);
      }
      return updated;
    });
  }, []);

  const handleRoleCreated = () => {
    closeModal();
  };

  return (
    <>
      <ToolBar
        selectedItems={selectedRoles}
        // deleteFuncion={openDeleteModal}
        addFunction={openModal}
      />
      <div className="overflow-x-auto">
        {IsLoading ? (
          <Loading />
        ) : (
          // Display loading indicator

          <table className="table table-xs  w-full rounded-sm border border-base-300/20">
            <thead className="text-pretty text-base-content">
              <TableHeader
                selectedItems={selectedRoles}
                itemsLength={roles.length}
                handleSelectAllChange={handleSelectAllChange}
                searchTerms={searchTerms}
                handleSearchChange={handleSearchChange}
                columnLabels={["Nom", "Description"]}
                searchFields={["role", "Description"]}
              />
            </thead>
            <tbody>
              {filteredRoles.map((role) => (
                <TableRow
                  key={role.id}
                  item={role}
                  selectedItems={selectedRoles}
                  handleCheckboxChange={handleCheckboxChange}
                  columns={[
                    { field: "role_name" },
                    { field: "role_description" },
                  ]}
                  editLinkBase="/role.edit"
                  // detailsLinkBase="/permissions.show"
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isCreateModalOpen && (
        <dialog id="my_modal_3" className="modal bg-black/10" open>
          <div className="modal-box w-fit bg-white rounded-md">
            <h3 className="text-lg font-bold pb-3">Cree un Role</h3>
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={closeModal}
            >
              ✕
            </button>
            <CreateRole onSuccess={handleRoleCreated} />;
          </div>
        </dialog>
      )}
    </>
  );
};

export default RolesTable;
