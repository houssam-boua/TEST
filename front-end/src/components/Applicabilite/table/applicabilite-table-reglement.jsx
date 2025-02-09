import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createApplicabilite, fetchExigences } from "../../../api/api";
import TableHeader2 from "../../common/TableHeader2";
import TableRow2 from "../../common/TableRow2";
import ToolBar from "../../common/tool-bar";
import { Loading } from "../../common/Loading";
import { ErrorAlert, SuccessAlert } from "../../shared/Alerts";

const ApplicabiliteReglement = () => {
  const { reglementId, adminstratif } = useParams();
  const [exigences, setExigences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applicabiliteUpdates, setApplicabiliteUpdates] = useState([]);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch exigences
  useEffect(() => {
    const fetchExigencesData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchExigences(adminstratif, reglementId);
        if (response && response.exigences) {
          setExigences(response.exigences);
        } else {
          setExigences([]);
          setIsSuccess(false);
          setIsError(true);
          setMessage("No exigences found");
        }
      } catch (error) {
        setIsSuccess(false);
        setIsError(true);
        setMessage("Failed to fetch exigences");
        setExigences([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (reglementId) {
      fetchExigencesData();
    }
  }, [adminstratif, reglementId]);

  // Handle select change
  const handleApplicabiliteChange = (e) => {
    const exigence_id = e.target.getAttribute("data-exigence-id");
    const is_applicable = e.target.value;

    setApplicabiliteUpdates((prev) => {
      const existingUpdate = prev.find(
        (update) => update.exigence_id === exigence_id
      );
      if (existingUpdate) {
        // Update existing value
        return prev.map((update) =>
          update.exigence_id === exigence_id
            ? { ...update, is_applicable }
            : update
        );
      } else {
        // Add new update
        return [...prev, { exigence_id, is_applicable }];
      }
    });
  };

  // Handle adding applicabilite
  const handleApplicabilite = async () => {
    try {
      if (applicabiliteUpdates.length > 0) {
        const response = await createApplicabilite({
          applicabilite: applicabiliteUpdates,
        });
        if (response) {
          setIsSuccess(true);
          setIsError(false);
          setMessage("Applicabilite added successfully");
        }
      } else {
        setIsSuccess(false);
        setIsError(true);
        setMessage("No changes to save");
      }
    } catch (error) {
      setMessage("Error adding applicabilite", error);
    }
  };

  // Buttons for triggering applicabilite
  const buttons = [
    {
      onClick: handleApplicabilite,
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
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      ),
      label: "Applicate",
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  if (exigences.length === 0) {
    return <div>No exigences found</div>;
  }

  const columns = [
    { field: "reglement_article", value: (val) => val },
    { field: "exigence_content", value: (val) => val },
    { field: "exigence_description", value: (val) => val },
    {
      field: "applicabilite",
      value: (val, exigenceIndex) => (
        <select
          name="applicabilite"
          className="border border-secondary/400  w-full p-3 mr-2 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-primary/700 placeholder-secondary/600 text-secondary-content"
          defaultValue={
            val === "Applicable" ? 1 : val === "Non Applicable" ? 0 : ""
          }
          data-exigence-id={exigences[exigenceIndex]?.id} // Use the id from exigences
          onChange={handleApplicabiliteChange}
        >
          <option value="" disabled>
            ------
          </option>
          <option value={0}>Non Applicable</option>
          <option value={1}>Applicable</option>
        </select>
      ),
    },
  ];

  return (
    <>
      {isError && <ErrorAlert message={message} />}
      {isSuccess && <SuccessAlert message={message} />}
      <ToolBar dynamicLeftButtons={buttons} />
      <div className="overflow-x-auto">
        <table className="table table-xs w-full rounded-sm border border-base-300/20 border-l-0">
          <thead className="text-pretty text-base-content">
            <TableHeader2
              columnLabels={[
                "Article",
                "Content",
                "Description",
                "Applicabilite",
              ]}
            />
          </thead>
          <tbody>
            {exigences.map((exigence, index) => (
              <TableRow2
                key={exigence.id || index}
                rowData={exigence}
                columns={columns.map((col) =>
                  col.field === "applicabilite"
                    ? { ...col, value: (val) => col.value(val, index) }
                    : col
                )}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ApplicabiliteReglement;
