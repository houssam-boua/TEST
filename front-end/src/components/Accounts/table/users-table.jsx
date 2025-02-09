import React, { useCallback, useEffect, useState } from "react";
import { getUsers } from "../../../services/usersService";
import { useNavigate } from "react-router-dom";
import ToolBar from "../../common/tool-bar";
import TableRow from "../../common/TableRow";
import TableHeader from "../../common/TableHeader";
import { deleteUser, resetPassword } from "../../../api/api";
import { Loading } from "../../common/Loading";
import YesNoModal from "../../common/YesNoModal";
import { ErrorAlert, SuccessAlert } from "../../shared/Alerts";

const UsersTable = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [IsLoading, setIsLoading] = useState(false); // Add loading state for async actions
  const [selectedUsers, setSelectedUsers] = useState(new Set()); // To keep track of selected users
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleAddButton = () => {
    navigate("/users/create");
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
        setIsLoading(false);
        setIsError(false);
        setIsSuccess(true);
      } catch (error) {
        console.error("Error fetching users data:", error);
        setIsSuccess(false);
        setIsError(true);
        setMessage("Erreur lors du chargement des utilisateurs");
      }
    };

    fetchUsers();
  }, []);

  const [searchTerms, setSearchTerms] = useState({
    lastName: "",
    firstName: "",
    matricule: "",
    phone: "",
    email: "",
    site: "",
    administratif: "",
    role: "",
    status: "",
  });

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchTerms((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectAllChange = useCallback(
    (e) => {
      const isChecked = e.target.checked;
      const allReglementIds = new Set(
        isChecked ? users.map((reglement) => reglement.id) : []
      );
      setSelectedUsers(allReglementIds);
    },
    [users]
  );

  const handleCheckboxChange = useCallback((userId) => {
    setSelectedUsers((prevState) => {
      const updated = new Set(prevState);
      if (updated.has(userId)) {
        updated.delete(userId);
      } else {
        updated.add(userId);
      }
      return updated;
    });
  }, []);

  const filteredUsers = users.filter((user) => {
    return (
      (user.last_name?.toLowerCase() || "").includes(
        searchTerms.lastName.toLowerCase()
      ) &&
      (user.first_name?.toLowerCase() || "").includes(
        searchTerms.firstName.toLowerCase()
      ) &&
      (user.matricule?.toLowerCase() || "").includes(
        searchTerms.matricule.toLowerCase()
      ) &&
      (user.phone?.toLowerCase() || "").includes(
        searchTerms.phone.toLowerCase()
      ) &&
      (user.email?.toLowerCase() || "").includes(
        searchTerms.email.toLowerCase()
      ) &&
      (user.site_name?.toLowerCase() || "").includes(
        searchTerms.site.toLowerCase()
      ) &&
      (user.role_name?.toLowerCase() || "").includes(
        searchTerms.role.toLowerCase()
      ) &&
      (user.status?.toLowerCase() || "").includes(
        searchTerms.status.toLowerCase()
      )
    );
  });

  const handleDelete = useCallback(
    async (e) => {
      e.preventDefault();
      if (selectedUsers.size === 0) return;
      try {
        for (const userId of selectedUsers) {
          const response = await deleteUser(userId);
          if (response.success) {
            setUsers((prevUsers) =>
              prevUsers.filter((user) => user.id !== userId)
            );
          } else {
            console.error("Error deleting user with id:", userId);
            setIsSuccess(false);
            setIsError(true);
            setMessage("Erreur lors de la suppression d'utilisateur");
          }
        }

        const remainingUsers = users.filter(
          (user) => !selectedUsers.has(user.id)
        );
        setUsers(remainingUsers);
        setSelectedUsers(new Set());
        closeDeleteModal();
        setIsError(false);
        setIsSuccess(true);
        setMessage("Utilisateur supprimé avec succès");
      } catch (error) {
        console.error("Error deleting users:", error);
      }
    },
    [selectedUsers, users]
  );

  const handleResetPassword = useCallback(async (e) => {
    e.preventDefault();
    try {
      for (const userId of selectedUsers) {
        const response = await resetPassword(userId);
        if (response.success) {
          console.log("Password reset for user with id:", userId);
          setIsError(false);
          setIsSuccess(true);
          setMessage("Renitialisation du mot de passe réussie");
        } else {
          console.error("Error resetting password for user with id:", userId);
        }
      }
    } catch (error) {
      console.error("Error resetting password for users:", error);
    }
  });

  const goToEdit = useCallback((e) => {
    e.preventDefault();
    try {
      for (const userId of selectedUsers) {
        navigate(`/users/edit/${userId}`);
      }
    } catch (error) {
      console.error("Error editing user:", error);
    }
  });

  const buttons = [
    {
      onClick: goToEdit,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
          />
        </svg>
      ),
      disabled: selectedUsers.size !== 1,
    },
    {
      onClick: handleResetPassword,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
      label: "réinitialiser mot de passe",
      disabled: selectedUsers.size !== 1,
    },
  ];

  return (
    <>
      {isSuccess && <SuccessAlert message={message} />}
      {isError && <ErrorAlert message={message} />}
      {/* Toolbar */}
      <ToolBar
        selectedItems={selectedUsers}
        addFunction={handleAddButton}
        deleteFuncion={openDeleteModal}
        dynamicLeftButtons={buttons}
      />

      {/* Table */}
      <div className="overflow-x-auto">
        {IsLoading ? (
          <Loading />
        ) : (
          <table className="table table-xs w-full border border-base-300/20 shadow-xs rounded-sm">
            <thead className="text-pretty text-base-content">
              <TableHeader
                selectedItems={selectedUsers}
                itemsLength={users.length}
                handleSelectAllChange={handleSelectAllChange}
                searchTerms={searchTerms}
                handleSearchChange={handleSearchChange}
                columnLabels={[
                  "Nom",
                  "Prenom",
                  "matricule",
                  "Téléphone",
                  "Email",
                  "Site",
                  "Rôle",
                ]}
                searchFields={[
                  "nom",
                  "prenom",
                  "matricule",
                  "tele",
                  "email",
                  "site",
                  "role",
                ]}
              />
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  item={user}
                  selectedItems={selectedUsers}
                  handleCheckboxChange={handleCheckboxChange}
                  columns={[
                    { field: "last_name" },
                    { field: "first_name" },
                    { field: "matricule" },
                    { field: "phone" },
                    { field: "email" },
                    { field: "site_name" },
                    { field: "role_name" },
                  ]}
                  editLinkBase="users/edit/"
                  detailsLinkBase=""
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
      {isDeleteModalOpen && (
        <YesNoModal
          title="Supprimer utilisateur"
          Question="Voulez-vous vraiment supprimer cet utilisateur?"
          YesTitle="Supprimer"
          NoTitle="Annuler"
          handleYes={handleDelete}
          handleNo={closeDeleteModal}
        />
      )}
    </>
  );
};

export default UsersTable;
