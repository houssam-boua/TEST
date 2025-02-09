import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  getReglements,
  getReglementsByAdministatif,
} from "../../../services/reglementService";
import { useNavigate, useParams } from "react-router-dom";
import { deleteReglement } from "../../../api/api";
import ToolBar from "../../common/tool-bar";
import DeleteModal from "../../common/DeleteModal";
import TableHeader from "../../common/TableHeader";
import TableRow from "../../common/TableRow";
import { Loading } from "../../common/Loading";
import YesNoModal from "../../common/YesNoModal";

const ReglementTable = () => {
  const { adminstratif } = useParams();
  const navigate = useNavigate();
  const [reglements, setReglements] = useState([]);
  const [selectedReglements, setSelectedReglements] = useState(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [IsLoading, setIsLoading] = useState(false); // Add loading state for async actions
  const [searchTerms, setSearchTerms] = useState({
    theme: "",
    domain: "",
    type: "",
    ref: "",
    title: "",
    publicationDate: "",
  });

  // Fetch reglements data
  useEffect(() => {
    const fetchReglements = async () => {
      setIsLoading(true);
      try {
        const reglementsData = await getReglementsByAdministatif(adminstratif);
        setReglements(reglementsData);
      } catch (error) {
        console.error("Error fetching reglements data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReglements();
  }, []);

  // Memoize the filtered reglements to avoid recalculation on every render
  const filteredReglements = useMemo(() => {
    return reglements.filter((reglement) => {
      return (
        (reglement.theme_name?.toLowerCase() || "").includes(
          searchTerms.theme.toLowerCase()
        ) &&
        (reglement.type_name?.toLowerCase() || "").includes(
          searchTerms.type.toLowerCase()
        ) &&
        (reglement.domain_name?.toLowerCase() || "").includes(
          searchTerms.domain.toLowerCase()
        ) &&
        (reglement.regulation_ref?.toLowerCase() || "").includes(
          searchTerms.ref.toLowerCase()
        ) &&
        (reglement.regulation_title?.toLowerCase() || "").includes(
          searchTerms.title.toLowerCase()
        ) &&
        (reglement.publication_date?.toLowerCase() || "").includes(
          searchTerms.publicationDate.toLowerCase()
        )
      );
    });
  }, [reglements, searchTerms]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleSelectAllChange = useCallback(
    (e) => {
      const isChecked = e.target.checked;
      const allReglementIds = new Set(
        isChecked ? reglements.map((reglement) => reglement.id) : []
      );
      setSelectedReglements(allReglementIds);
    },
    [reglements]
  );

  const handleCheckboxChange = useCallback((reglementId) => {
    setSelectedReglements((prevState) => {
      const updated = new Set(prevState);
      if (updated.has(reglementId)) {
        updated.delete(reglementId);
      } else {
        updated.add(reglementId);
      }
      return updated;
    });
  }, []);

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleDelete = useCallback(
    async (e) => {
      e.preventDefault();
      if (selectedReglements.size === 0) return;

      try {
        for (const reglementId of selectedReglements) {
          const response = await deleteReglement(reglementId);
          if (response.success) {
            setReglements((prev) =>
              prev.filter((reglement) => reglement.id !== reglementId)
            );
          } else {
            console.error(
              `Failed to delete reglement ${reglementId}: ${response.message}`
            );
          }
        }
        const remainingReglements = reglements.filter(
          (reglement) => !selectedReglements.has(reglement.id)
        );
        setReglements(remainingReglements);
        setSelectedReglements(new Set());
        closeDeleteModal();
      } catch (error) {
        console.error("Error deleting reglements:", error);
      }
    },
    [selectedReglements, reglements]
  );

  const handleSearchChange = useCallback((e) => {
    const { name, value } = e.target;
    setSearchTerms((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAddButton = () => {
    navigate("/reglements/create"); // Navigate to /reglement.create
  };

  const handldleExamination = (id) => {
    return () =>
      navigate(`/applicabilite/reglement/${id}/admin/${adminstratif}`);
  };
  const handleExport = () => console.log("Export button clicked");

  const Rightbuttons = [
    {
      onClick: handleExport,
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
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
          />
        </svg>
      ),
      label: "Export",
    },
    {
      onClick: handleExport,
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
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
      ),
      label: "Import",
    },
  ];

  const LeftButtons = [
    {
      onClick: handldleExamination(selectedReglements.values().next().value),
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
            d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z"
          />
        </svg>
      ),
      label: "Examiner applicabilite",
      disabled: selectedReglements.size !== 1,
    },
  ];

  return (
    <>
      {/* Toolbar */}
      <ToolBar
        selectedItems={selectedReglements}
        deleteFuncion={openDeleteModal}
        addFunction={handleAddButton}
        dynamicRightButtons={Rightbuttons}
        dynamicLeftButtons={LeftButtons}
      />

      {/* Table */}
      <div className="overflow-x-auto">
        {IsLoading ? (
          <Loading />
        ) : (
          // Display loading indicator
          <table className="table table-xs  w-full rounded-sm border border-base-300/20 border-l-0 ">
            <thead className="text-pretty text-base-content">
              <TableHeader
                selectedItems={selectedReglements}
                itemsLength={reglements.length}
                handleSelectAllChange={handleSelectAllChange}
                searchTerms={searchTerms}
                handleSearchChange={handleSearchChange}
                columnLabels={[
                  "Theme",
                  "Domaine",
                  "Type",
                  "Ref",
                  "Titre",
                  "Date de publication",
                  "Exigence",
                ]}
                searchFields={[
                  "theme",
                  "domain",
                  "type",
                  "ref",
                  "title",
                  "publicationDate",
                ]}
              />
            </thead>
            <tbody>
              {filteredReglements.map((reglement) => (
                <TableRow
                  key={reglement.id}
                  item={reglement}
                  selectedItems={selectedReglements}
                  handleCheckboxChange={handleCheckboxChange}
                  columns={[
                    { field: "theme_name" },
                    { field: "domain_name" },
                    { field: "type_name" },
                    { field: "regulation_ref" },
                    { field: "regulation_title" },
                    { field: "publication_date" },
                  ]}
                  editLinkBase="/reglement.edit"
                  detailsLinkBase={`/exigences/reglement/${adminstratif}`}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <YesNoModal
          isOpen={isDeleteModalOpen}
          closeFunction={closeDeleteModal}
          title="Supprimer les reglements"
          message="Voulez-vous vraiment supprimer les reglements sélectionnés ?"
          onYes={handleDelete}
        />
      )}
    </>
  );
};

export default ReglementTable;
