import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  createConformite,
  fetchApplicabiliteByAdminstratifId,
} from "../../../api/api";
import { Loading } from "../../common/Loading";
import { ErrorAlert, SuccessAlert } from "../../shared/Alerts";
import ToolBar from "../../common/tool-bar";
import TableHeader2 from "../../common/TableHeader2";
import TableRow2 from "../../common/TableRow2";

const ConformiteReglementTable = () => {
  const { adminstratifId } = useParams();
  const [applicabilites, setApplicabilites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applicabiliteUpdates, setApplicabiliteUpdates] = useState([]);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch applicabilites data
  useEffect(() => {
    const fetchApplicabilitesData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchApplicabiliteByAdminstratifId(
          adminstratifId
        );
        if (response) {
          setApplicabilites(response);
        } else {
          setApplicabilites([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (adminstratifId) {
      fetchApplicabilitesData();
    }
  }, [adminstratifId]);

  const handleConformityAdd = async () => {
    try {
      const response = await createConformite(applicabiliteUpdates);
      console.log("response", response);
      if (response.success) {
        setIsSuccess(true);
        setIsError(false);
        setMessage(response.message);
      } else {
        setIsError(true);
        setMessage("Failed to add conformity.");
      }
    } catch (error) {
      setIsError(true);
      setMessage("Failed to add conformity.");
      console.error(error);
    }
  };

  // Buttons for toolbar
  const buttons = [
    {
      onClick: handleConformityAdd,
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

  const handleConformityChange = (e, exigenceIndex, applicabilityId) => {
    const conformity_type_id = e.target.value;

    // Get the description from a corresponding input field
    const conformity_description = document.getElementById(
      `conformity_description-${exigenceIndex}`
    )?.value;

    // Update applicabiliteUpdates
    setApplicabiliteUpdates((prev) => {
      const updated = [...prev];
      updated[exigenceIndex] = {
        applicability_id: applicabilityId,
        conformity_description,
        conformity_type_id,
      };
      return updated;
    });
  };

  const columns = [
    { field: "regulation_ref", value: (val) => val },
    { field: "reglement_article", value: (val) => val },
    { field: "exigence_content", value: (val) => val },
    { field: "exigence_description", value: (val) => val },
    {
      field: "conformity_description",
      value: (_, index) => (
        <textarea
          id={`conformity_description-${index}`}
          type="text"
          row
          className="border-b border-base-300/20 w-full pl-1 py-1 bg-transparent text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
          onChange={(e) =>
            handleConformityChange(
              e,
              index,
              applicabilites[index]?.applicability_id
            )
          }
          placeholder="Description"
        />
      ),
    },
    {
      field: "conformity_type_id",
      value: (val, index) => (
        <select
          id={`conformity_type_id-${index}`}
          name="conformity_type_id"
          className="border border-secondary/400 w-full p-3 mr-2 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-primary/700 placeholder-secondary/600 text-secondary-content"
          value={val}
          defaultValue=""
          onChange={(e) =>
            handleConformityChange(
              e,
              index,
              applicabilites[index]?.applicability_id
            )
          }
        >
          <option value="" disabled>
            ------
          </option>
          <option value={1}>Conforme</option>
          <option value={2}>NC Majeure</option>
          <option value={3}>Non-Conforme</option>
          <option value={4}>NC Mineure</option>
        </select>
      ),
    },
  ];

  return (
    <>
      <ToolBar dynamicLeftButtons={buttons} />
      <div className="overflow-x-auto">
        <table className="table table-xs w-full rounded-sm border border-base-300/20 border-l-0">
          <thead className="text-pretty text-base-content">
            <TableHeader2
              columnLabels={[
                "Reference",
                "Article",
                "Contenu",
                "Exigence Description",
                "Description",
                "Conformite",
              ]}
            />
          </thead>
          <tbody>
            {applicabilites.map((exigence, index) => (
              <TableRow2
                key={exigence.id || index}
                rowData={exigence}
                columns={columns.map((col) =>
                  col.field === "conformity_type_id" ||
                  col.field === "conformity_description"
                    ? { ...col, value: (val) => col.value(val, index) }
                    : col
                )}
              />
            ))}
          </tbody>
        </table>
      </div>
      {isError && <ErrorAlert message={message} />}
      {isSuccess && <SuccessAlert message={message} />}
    </>
  );
};

export default ConformiteReglementTable;
