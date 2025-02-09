import React, { useEffect, useState } from "react";
import { deleteExigence, fetchExigences } from "../../../api/api";
import ExigenceCreate from "../forms/exigence-create";
import { useParams } from "react-router-dom";
import ExigenceUpdate from "../forms/exigence-update";
import TableHeader from "../../common/TableHeader";
import TableRow from "../../common/TableRow";
import ToolBar from "../../common/tool-bar";
import { Loading } from "../../common/Loading";
import YesNoModal from "../../common/YesNoModal";

const ExigencesTable = () => {
  const { reglementid, adminstratif } = useParams();

  const [exigences, setExigences] = useState([]);
  const [selectedExigences, setSelectedExigences] = useState(new Set());
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [IsLoading, setIsLoading] = useState(false); // Add loading state for async actions

  const [searchTerms, setSearchTerms] = useState({
    ID: "",
    Article: "",
    Content: "",
    Ref: "",
    Titre: "",
    Date_de_publication: "",
  });

  useEffect(() => {
    const ExigencesData = async () => {
      try {
        const response = await fetchExigences(adminstratif, reglementid);
        if (response) {
          console.log(response);
          setExigences(response.exigences);
        }
      } catch (error) {
        console.error("Error fetching exigences", error);
      }
    };
    ExigencesData();
  }, [adminstratif, reglementid]);

  const openModal = () => setIsCreateModalOpen(true);
  const closeModal = () => setIsCreateModalOpen(false);

  const openEditModal = (exigenceId) => {
    setSelectedItemId(exigenceId);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => setIsEditModalOpen(false);
  const openDeleteModal = () => setIsDeleteModalOpen(true);

  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      const allExigenceIds = new Set(exigences.map((exigence) => exigence.id));
      setSelectedExigences(allExigenceIds);
    } else {
      setSelectedExigences(new Set());
    }
  };

  const handleCheckboxChange = (exigenceId) => {
    setSelectedExigences((prevSelectedExigences) => {
      const updatedSelectedExigences = new Set(prevSelectedExigences);
      if (updatedSelectedExigences.has(exigenceId)) {
        updatedSelectedExigences.delete(exigenceId);
      } else {
        updatedSelectedExigences.add(exigenceId);
      }
      return updatedSelectedExigences;
    });
  };

  // Handle delete action
  const handleDelete = async (e) => {
    e.preventDefault();

    if (selectedExigences.size === 0) {
      console.warn("No exigences selected for deletion");
      return;
    }

    try {
      // Iterate through the Set of selected exigences
      for (const exigenceId of selectedExigences) {
        const response = await deleteExigence(exigenceId); // Pass the account ID

        if (response.success) {
          console.log(`Exigence with ID ${exigenceId} deleted successfully`);
        } else {
          console.error(
            `Failed to delete exigence ${exigenceId}: ${response.message}`
          );
        }
      }

      // After all deletions, update the exigences list and clear the selection
      const remainingExigences = exigences.filter(
        (exigence) => !selectedExigences.has(exigence.id)
      );
      setExigences(remainingExigences); // Update exigences list
      setSelectedExigences(new Set()); // Clear selected exigences
      closeDeleteModal(); // Close the delete confirmation modal
    } catch (error) {
      console.error("Error deleting exigences:", error);
    }
  };

  const handleSearchChange = (field, value) => {
    setSearchTerms((prevSearchTerms) => ({
      ...prevSearchTerms,
      [field]: value,
    }));
  };

  return (
    <>
      <ToolBar
        deleteFuncion={openDeleteModal}
        selectedItems={selectedExigences}
        addFunction={openModal}
      />

      <div className="overflow-x-auto">
        {IsLoading ? (
          <Loading /> // Display loading indicator
        ) : (
          <div>
            <table className="table table-xs  w-full rounded-sm border border-base-300/20 border-l-0">
              <thead className="text-pretty text-base-content">
                <TableHeader
                  selectedItems={selectedExigences}
                  itemsLength={exigences.length}
                  handleSelectAllChange={handleSelectAllChange}
                  handleSearchChange={handleSearchChange}
                  searchTerms={searchTerms}
                  columnLabels={["Article", "Content", "Ref"]}
                  searchFields={["Article", "Content", "Ref"]}
                />
              </thead>

              <tbody>
                {exigences.map((exigence) => (
                  <TableRow
                    key={exigence.id}
                    item={exigence}
                    selectedItems={selectedExigences}
                    handleCheckboxChange={handleCheckboxChange}
                    columns={[
                      { field: "reglement_article" },
                      { field: "exigence_content" },
                      { field: "exigence_description" },
                    ]}
                    customActions={(item) => (
                      <button
                        className="link link-accent link-hover"
                        onClick={() => openEditModal(item.id)} // Calls the function with item ID
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-4"
                        >
                          <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                        </svg>
                      </button>
                    )}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isCreateModalOpen && (
        <dialog id="my_modal_3" className="modal bg-black/10" open>
          <div className="modal-box w-fit bg-white rounded-md">
            <h3 className="text-lg font-bold pb-3">Create Exigence</h3>

            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={closeModal}
            >
              ✕
            </button>

            <ExigenceCreate />
          </div>
        </dialog>
      )}

      {isEditModalOpen && (
        <dialog id="my_modal_3" className="modal bg-black/10" open>
          <div className="modal-box w-full max-w-4xl bg-white rounded-md">
            <h3 className="text-lg font-bold pb-10">Edit Exigence</h3>

            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={closeEditModal}
            >
              ✕
            </button>

            <ExigenceUpdate exigenceId={selectedItemId} />
          </div>
        </dialog>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <YesNoModal
          title="Supprimer Exigence"
          Question={`Veuillez supprimer cette exigence?`}
          YesTitle={"Confirmer"}
          handleYes={handleDelete}
          NoTitle={"Annuler"}
          handleNo={closeDeleteModal}
        />
      )}
    </>
  );
};

export default ExigencesTable;
