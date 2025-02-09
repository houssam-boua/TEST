import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  createActions,
  fetchConformiteByAdministration,
} from "../../../api/api";
import TableHeader2 from "../../common/TableHeader2";
import TableRow2 from "../../common/TableRow2";
import ActionCreate from "../form/action-create";
import ToolBar from "../../common/tool-bar";

function ActionReglementTable() {
  const { administratif } = useParams();
  const [data, setData] = useState(null);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [actions, setActions] = useState([]);
  const [selectedConformity, setSelectedConformity] = useState();
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const addAction = (newAction) => {
    console.log(newAction);
    setActions((prevActions) => [...prevActions, newAction]);
  };

  useEffect(() => {
    const fetchDataById = async () => {
      try {
        const response = await fetchConformiteByAdministration(administratif);
        console.log(response);
        setData(response);
        console.log(data);
      } catch (error) {
        console.error("Error fetching applicability overview data:", error);
      }
    };
    fetchDataById();
  }, [administratif]);

  const closeCreationModal = () => {
    setIsCreationModalOpen(false);
  };
  const openCreationModal = (conformityId) => {
    setSelectedConformity(conformityId); // Store the conformity ID in state
    console.log(conformityId);
    setIsCreationModalOpen(true); // Open the modal
  };

  const columns = [
    {
      field: "regulation_ref",
      label: "regulation",
      value: (val) => val,
    },
    {
      field: "reglement_article",
      label: "Article",
      value: (val) => val,
    },
    {
      field: "exigence_content",
      label: "Exigence",
      value: (val) => val,
    },
    {
      field: "exigence_description",
      label: "Description d'exigence",
      value: (val) => val,
    },
    {
      field: "conformity_type_name",
      label: "Type",
      value: (val) => val,
    },
    {
      field: "conformity_description",
      label: "Description ",
      value: (val) => val,
    },
    {
      field: "conformity_id",
      label: "Action",
      value: (row) => (
        <button
          className="btn btn-xs btn-circle  outline-none btn-primary bg-primary/90 text-accent-content "
          onClick={() => openCreationModal(row)}
        >
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      ),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Assuming you want to submit all actions in `actions`
    if (actions.length === 0) {
      setIsError(true);
      setIsSuccess(false);
      setMessage("No actions to submit");
      return;
    }

    try {
      // Replace this with your API call
      const response = await createActions(actions);
      setIsError(false);
      setIsSuccess(true);
      setMessage("User created successfully");
      console.log(response);
      setActions([]);
    } catch (error) {
      console.error(error);
      setIsError(true);
      setIsSuccess(false);
      setMessage(error.response.message);
    }
  };
  const LeftButtons = [
    {
      label: "Ajouter une action",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      ),
      onClick: handleSubmit,
    },
  ];

  return (
    <>
      <ToolBar dynamicLeftButtons={LeftButtons} />

      <table className="table table-xs  w-full rounded-sm border border-base-300/20 border-l-0">
        <thead className="text-pretty text-base-content">
          <TableHeader2
            columnLabels={(columns || []).map((column) => column.label)}
          />
        </thead>
        <tbody>
          {data ? (
            data.map((item, index) => (
              <TableRow2
                key={item.id || index}
                rowData={item}
                columns={columns}
              />
            ))
          ) : (
            <tr className="center">
              <td colSpan={columns.length}>No data available</td>
            </tr>
          )}
        </tbody>
      </table>

      {isCreationModalOpen && (
        <dialog id="my_modal_3" className="modal bg-black/10" open>
          <div className="modal-box w-full bg-white rounded-md">
            <h3 className="text-lg font-bold pb-3">Ajouter une action</h3>

            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={closeCreationModal}
            >
              ✕
            </button>
            <ActionCreate
              conformityId={selectedConformity}
              onSaveAction={addAction}
            />
          </div>
        </dialog>
      )}
    </>
  );
}

export default ActionReglementTable;
