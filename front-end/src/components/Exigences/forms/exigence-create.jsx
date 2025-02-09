import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CreateExigence } from "../../../services/exigencesService";
import {
  fetchAdministratifGeneral,
  fetchAdministratifGeneralByReglementId,
  fetchReglementsData,
} from "../../../api/api";

const ExigenceCreate = () => {
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [administratisG, setAdminstratifG] = useState([]);
  const [selectedAdministratifG, setSelectedAdministratifG] = useState([]);

  const [reglementsIds, setReglementsIds] = useState([]);

  const [exigenceData, setExigenceData] = useState({
    reglementId: "", // Change this to match your state
    content: "",
    description: "",
    article: "",
    admin_general_ids: [],
  });

  useEffect(() => {
    const getAdminstratifG = async () => {
      try {
        const adminstratifG = await fetchAdministratifGeneralByReglementId(
          exigenceData.reglementId
        );
        console.log("id", exigenceData.reglementId);
        setAdminstratifG(adminstratifG);
      } catch (error) {
        console.error("Error fetching adminstratif general data:", error);
      }
    };
    getAdminstratifG();
  }, [exigenceData.reglementId]);

  useEffect(() => {
    const fetReglementId = async () => {
      try {
        const reglementIds = await fetchReglementsData();
        setReglementsIds(reglementIds);
      } catch (error) {
        console.error("Error fetching reglement id:", error);
      }
    };
    fetReglementId();
  }, []); // Add the empty dependency array here to run this once when component mounts.

  const handleInputChange = (e) => {
    setExigenceData({
      ...exigenceData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await CreateExigence({
        ...exigenceData,
        admin_general_ids: selectedAdministratifG,
      });

      setMessage("Exigence created successfully!");
      if (response.success) {
        setIsSuccess(true);
        setIsError(false);
        // Close the modal after a successful save
      } else {
        setIsError(true);
        setMessage(response.message || "Failed to create exigence.");
      }
    } catch (error) {
      console.error("Error creating exigence:", error);
      setIsError(true);
      setMessage("An error occurred while creating the exigence.");
    }
  };

  const handleTagAdd = (event) => {
    const value = event.target.value;
    if (value && !selectedAdministratifG.includes(parseInt(value))) {
      setSelectedAdministratifG([...selectedAdministratifG, parseInt(value)]);
      event.target.value = ""; // Clear the dropdown selection
    }
  };

  const removeTag = (id) => {
    setSelectedAdministratifG(
      selectedAdministratifG.filter((tagId) => tagId !== id)
    );
  };

  const handleReset = (e) => {
    e.preventDefault();
    setExigenceData({
      reglementId: "", // Change this to match your state
      content: "",
      description: "",
      article: "",
      admin_general_ids: [],
    });
  };

  useEffect(() => {
    setExigenceData((prev) => ({
      ...prev,
      admin_general_ids: selectedAdministratifG,
    }));
  }, [selectedAdministratifG]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-xl space-y-6 mx-auto  ">
        <div className="border border-base-300/20 w-full p-3 shadow-xs bg-transparent rounded">
          <div className="mt-7 grid gap-x-5 gap-y-3 sm:grid-cols-6">
            <div className="sm:col-span-full tags-input-container">
              <label
                htmlFor="reglementId"
                className="block text-sm leading-6 text-secondary-content/60"
              >
                Reglement
              </label>
              <div className="tags-display flex flex-wrap">
                <select
                  id="reglement"
                  name="reglementId" // Ensure this is the correct name
                  autoComplete="reglement"
                  className="border border-base-300/20 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-primary text-secondary-content"
                  value={exigenceData.reglementId} // Bind value to reglementId
                  onChange={handleInputChange}
                >
                  <option value="" disabled>
                    Saisir le reglement
                  </option>
                  {reglementsIds.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.regulation_ref}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="article"
                className="block text-sm  leading-6 text-secondary-content/60"
              >
                Article
              </label>
              <div className="mt-2">
                <input
                  id="article"
                  name="article"
                  type="text"
                  className="border-b border-base-300/20 w-full pl-1 py-1 bg-transparent text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={exigenceData.article}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="content"
                className="block text-sm  leading-6 text-secondary-content/60"
              >
                Content
              </label>
              <div className="mt-2">
                <input
                  id="content"
                  name="content"
                  type="text"
                  className="border-b border-base-300/20 w-full pl-1 py-1 bg-transparent text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={exigenceData.content}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="sm:col-span-full tags-input-container">
              <label
                htmlFor="administratif_general"
                className="block text-sm  leading-6 text-secondary-content/60"
              >
                Administratif
              </label>

              <select
                id="administratif_general"
                name="administratif_general"
                autoComplete="administratif_general"
                className="border border-base-300/20 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-primary text-secondary-content"
                onChange={handleTagAdd}
                defaultValue=""
              >
                <option value="" disabled>
                  -----
                </option>
                {administratisG.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.admin_general_name}
                  </option>
                ))}
              </select>
              <div className="tags-display flex flex-wrap">
                {selectedAdministratifG.map((id, index) => {
                  const admin = administratisG.find((admin) => admin.id === id);
                  return (
                    <div
                      className="tag-item rounded-md bg-base-100 p-2 mr-2 mt-2"
                      key={index}
                    >
                      <span className="text text-sm ">
                        {admin ? admin.admin_general_name : "Unknown"}
                      </span>
                      <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={() => removeTag(id)}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rest of the form for tags and description */}
            <div className="sm:col-span-full">
              <label
                htmlFor="description"
                className="block text-sm  leading-6 text-secondary-content/60"
              >
                Description
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className="textarea textarea-ghost textarea-sm border-b border-base-300/20 w-full pl-1 py-1 bg-transparent text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={exigenceData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Buttons aligned to the bottom-right */}
          <div className="mt-7 flex justify-end gap-x-6">
            <button
              type="button"
              className="bg-neutral/90 text-base-content px-8 py-2 text-sm  rounded hover:bg-neutral-300"
              onClick={handleReset}
            >
              Reset
            </button>

            <button
              type="submit"
              className="bg-primary text-primary-content px-8 py-2 text-sm  rounded hover:bg-primary/90 flex"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 7.125L18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              Save
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ExigenceCreate;
