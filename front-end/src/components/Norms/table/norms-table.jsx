import React, { useCallback, useEffect, useMemo, useState } from "react";
import { deleteNorm, fetchNormsData } from "../../../api/api";
import ToolBar from "../../common/tool-bar";
import TableHeader from "../../common/TableHeader";
import TableRow from "../../common/TableRow";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../common/DeleteModal";
import { Loading } from "../../common/Loading";

const NormsTable = () => {
  const navigate = useNavigate();
  const [norms, setNorms] = useState([]);
  const [selectedNorms, setSelectedNorms] = useState(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [IsLoading, setIsLoading] = useState(false);
  const [searchTerms, setSearchTerms] = useState({
    norm_ref: "",
    norm_abbreviation_name: "",
    norm_complet_name: "",
    norm_version: "",
    norm_pub_date: "",
    norm_developed_with: "",
  });
  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  useEffect(() => {
    const fetchNorms = async () => {
      try {
        const normsData = await fetchNormsData();
        setNorms(normsData);
      } catch (error) {
        console.error("failed to fetch norms data ");
      }
    };
    fetchNorms();
  }, []);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleSelectAllChange = useCallback(
    (e) => {
      const isChecked = e.target.checked;
      const allNormsIds = new Set(
        isChecked ? norms.map((reglement) => reglement.id) : []
      );
      setSelectedNorms(allNormsIds);
    },
    [norms]
  );

  const handleCheckboxChange = useCallback((normId) => {
    setSelectedNorms((prevState) => {
      const updated = new Set(prevState);
      if (updated.has(normId)) {
        updated.delete(normId);
      } else {
        updated.add(normId);
      }
      return updated;
    });
  }, []);

  const filteredNorms = useMemo(() => {
    return norms.filter((norm) => {
      const normRef = typeof norm.norm_ref === "string" ? norm.norm_ref : "";
      const normAbbreviation =
        typeof norm.norm_abbreviation_name === "string"
          ? norm.norm_abbreviation_name
          : "";
      const normCompleteName =
        typeof norm.norm_complet_name === "string"
          ? norm.norm_complet_name
          : "";
      const normVersion =
        typeof norm.norm_version === "string" ? norm.norm_version : "";
      const normPubDate =
        typeof norm.norm_pub_date === "string" ? norm.norm_pub_date : "";
      const normDevelopedWith =
        typeof norm.norm_developed_with === "string"
          ? norm.norm_developed_with
          : "";

      return (
        normRef.toLowerCase().includes(searchTerms.norm_ref.toLowerCase()) &&
        normAbbreviation
          .toLowerCase()
          .includes(searchTerms.norm_abbreviation_name.toLowerCase()) &&
        normCompleteName
          .toLowerCase()
          .includes(searchTerms.norm_complet_name.toLowerCase()) &&
        normVersion
          .toLowerCase()
          .includes(searchTerms.norm_version.toLowerCase()) &&
        normPubDate
          .toLowerCase()
          .includes(searchTerms.norm_pub_date.toLowerCase()) &&
        normDevelopedWith
          .toLowerCase()
          .includes(searchTerms.norm_developed_with.toLowerCase())
      );
    });
  }, [norms, searchTerms]);

  const handleSearchChange = useCallback((e) => {
    const { name, value } = e.target;
    setSearchTerms((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDelete = useCallback(async (e) => {
    e.preventDefault();
    if (selectedNorms.size === 0) return;

    try {
      for (const normId of selectedNorms) {
        const response = await deleteNorm(normId);
        if (response.success) {
          setNorms((prev) => prev.filter((norm) => norm.id !== normId));
        } else {
          console.error(`Failed to delete norm with id ${normId}`);
        }
      }
    } catch (error) {
      console.error("Failed to delete norm", error);
    } finally {
      setSelectedNorms(new Set());
      setIsDeleteModalOpen(false);
    }
  });

  const handleAddButton = () => {
    navigate("/norm.create"); // Navigate to /reglement.create
  };

  const handleExportButton = () => console.log("Export button clicked");

  const buttons = [
    {
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
            d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
          />
        </svg>
      ),
      label: "Examiner applicabilite",
    },
    {
      onClick: handleExportButton,
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

  return (
    <>
      <ToolBar
        selectedItems={selectedNorms}
        deleteFuncion={openDeleteModal}
        addFunction={handleAddButton}
        dynamicRightButtons={buttons}
      />

      <div className="overflow-x-auto">
        {IsLoading ? (
          <Loading />
        ) : (
          // Display loading indicator
          <table className="table table-xs  w-full rounded-sm border border-base-300/20 border-l-0">
            <thead className="text-pretty text-base-content">
              <TableHeader
                selectedItems={selectedNorms}
                itemsLength={norms.length}
                handleSelectAllChange={handleSelectAllChange}
                searchTerms={searchTerms}
                handleSearchChange={handleSearchChange}
                columnLabels={[
                  "Ref",
                  "Abbrev",
                  "Nom complet",
                  "Version",
                  "Date de publication",
                  "Nom developpement",
                  "Exigence",
                ]}
                searchFields={[
                  "ref",
                  "abbreviation",
                  "nom complet",
                  "version",
                  "date",
                  "develope",
                ]}
              />
            </thead>
            <tbody>
              {filteredNorms.map((norm) => (
                <TableRow
                  item={norm}
                  selectedItems={selectedNorms}
                  handleCheckboxChange={handleCheckboxChange}
                  columns={[
                    { field: "norm_ref" },
                    { field: "norm_abbreviation_name" },
                    { field: "norm_complet_name" },
                    { field: "norm_version" },
                    { field: "norm_pub_date" },
                    { field: "norm_developed_with" },
                  ]}
                  editLinkBase="/norm.edit"
                  detailsLinkBase={`/norms/chapitres`}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleDelete}
        onCancel={closeDeleteModal}
        message="Are you sure you want to delete the selected items?"
      />
    </>
  );
};

export default NormsTable;
