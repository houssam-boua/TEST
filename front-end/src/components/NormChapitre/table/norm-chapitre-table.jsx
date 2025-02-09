import React, { useState, useEffect } from "react";
import TableHeaderSection from "../../common/TableHeaderSection";
import SubChapterRow from "../../common/SubChapterRow";
import useSelection from "../../../hooks/useSelection";
import { fetchNormChapitres } from "../../../api/api";
import { useParams } from "react-router-dom";
import ToolBar from "../../common/tool-bar";
import DeleteModal from "../../common/DeleteModal";
import { Loading } from "../../common/Loading";

const NestedTable = () => {
  const { normId } = useParams();
  const [data, setData] = useState([]); // State for storing fetched data
  const [error, setError] = useState(null); // Error state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Fetch data from API when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); // Show loading
      setError(null); // Reset error state before fetching
      try {
        const responseData = await fetchNormChapitres(normId);
        console.log(responseData.data);
        setData(responseData.data || []); // Assume the response contains the `data` key
      } catch (err) {
        setError("Failed to fetch data", err); // Set error if API call fails
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false); // Hide loading spinner
      }
    };

    loadData();
  }, [normId]);

  const { selectedItems, handleSelectAllChange, handleCheckboxChange } =
    useSelection(data);

  const [searchTerms, setSearchTerms] = useState({});

  const handleSearchChange = (e) => {
    setSearchTerms({
      ...searchTerms,
      [e.target.name]: e.target.value,
    });
  };

  const columnLabels = ["Id", "Title", "Description"];
  const searchFields = ["id", "noRef", "description"];

  if (isLoading) {
    return <Loading />;
    // Display loading message
  }

  if (error) {
    return <div>{error}</div>; // Display error message
  }

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);
  const handleAddButton = () => {
    navigate("/norm.create"); // Navigate to /reglement.create
  };

  const handleExportButton = () => console.log("Export button clicked");

  const handleDelete = () => console.log("kdf");

  const leftButtons = [
    {
      label: "Supprimer",
      icon: {},
    },
  ];
  return (
    <>
      <ToolBar
        openDeleteModal={openDeleteModal}
        handleSearchChange={handleSearchChange}
        searchTerms={searchTerms}
        handleAddButton={handleAddButton}
        handleExportButton={handleExportButton}
      />
      <div className="overflow-x-auto">
        <table className="table table-xs  w-full rounded-sm border border-base-300/20 border-l-0">
          <thead className="text-pretty text-base-content">
            <TableHeaderSection
              selectedItems={selectedItems}
              itemsLength={data.reduce(
                (count, chapter) =>
                  count +
                  chapter.sub_chapters.reduce(
                    (subCount, subChapter) =>
                      subCount + subChapter.exigences.length,
                    0
                  ),
                0
              )}
              handleSelectAllChange={handleSelectAllChange}
              searchTerms={searchTerms}
              handleSearchChange={handleSearchChange}
              columnLabels={columnLabels}
              searchFields={searchFields}
            />
          </thead>
          <tbody>
            {data.map((chapter) =>
              // Iterate through each chapter
              chapter.sub_chapters.map((subChapter) => (
                <React.Fragment key={subChapter.sub_chapter_id}>
                  {/* Render subChapter row */}
                  <SubChapterRow
                    key={subChapter.sub_chapter_id}
                    subChapter={subChapter}
                    selectedItems={selectedItems}
                    handleCheckboxChange={handleCheckboxChange}
                    columns={searchFields.slice(1)} // Skip the 'Id' column
                  />
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
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

export default NestedTable;
