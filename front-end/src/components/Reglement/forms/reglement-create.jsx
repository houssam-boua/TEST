import React, { useEffect, useState } from "react";
import { createReglement, fetchAdministratifGeneral } from "../../../api/api";

import { ErrorAlert, SuccessAlert } from "../../shared/Alerts";
import { getExigences } from "../../../services/exigencesService";
import {
  creeateReglement,
  getReglementDomainByTheme,
  getReglementTypes,
} from "../../../services/reglementService";

const ReglementCreate = () => {
  const [reglementTypes, setReglementType] = useState([]);
  const [reglementDomains, setReglementDomain] = useState([]);
  const [exigences, setExigences] = useState([]);
  const [theme, setTheme] = useState("");
  const [administratisG, setAdminstratifG] = useState([]);
  const [selectedAdministratifG, setSelectedAdministratifG] = useState([]);
  useEffect(() => {
    const ExigencesData = async () => {
      try {
        const Exegences = await getExigences();
        setExigences(Exegences);
      } catch (error) {
        console.error("Error fetching exigences", error);
      }
    };
    ExigencesData();
  }, []);

  useEffect(() => {
    const fetchReglementType = async () => {
      try {
        const reglementTypeData = await getReglementTypes();
        setReglementType(reglementTypeData);
      } catch (error) {
        console.error("Error fetching reglement type data:", error);
      }
    };
    fetchReglementType();
  }, []);

  useEffect(() => {
    const fetchReglementDomainBytheme = async () => {
      try {
        const reglementDomainData = await getReglementDomainByTheme(theme);
        setReglementDomain(reglementDomainData);
        console.log("reglementDomainData", reglementDomainData);
      } catch (error) {
        console.error("Error fetching reglement domain data:", error);
      }
    };
    fetchReglementDomainBytheme();
  }, [theme]);

  useEffect(() => {
    const getAdminstratifG = async () => {
      try {
        const adminstratifG = await fetchAdministratifGeneral();
        setAdminstratifG(adminstratifG);
      } catch (error) {
        console.error("Error fetching adminstratif general data:", error);
      }
    };
    getAdminstratifG();
  }, []);

  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [reglement, setReglement] = useState({
    type: "",
    domain: "",
    ref: "",
    title: "",
    publicationDate: "",
    admin_general_ids: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReglement((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await creeateReglement({
        ...reglement,
        admin_general_ids: selectedAdministratifG,
      });
      console.log("response", response);
      if (response) {
        setIsError(false);
        setIsSuccess(true);
        setMessage("reglement created successfully");
      }
    } catch (error) {
      setIsError(true);
      setIsSuccess(false);
      setMessage("Failed to create reglement");
      console.error("Failed to create reglement", error);
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

  useEffect(() => {
    setReglement((prevState) => ({
      ...prevState,
      admin_general_ids: selectedAdministratifG,
    }));
    console.log("selectedAdministratifG", selectedAdministratifG);
  }, [selectedAdministratifG]);

  const handleResetInputs = () => {
    setReglement({
      type: "",
      domain: "",
      ref: "",
      title: "",
      publicationDate: "",
      admin_general_ids: [],
    });
    setSelectedAdministratifG([]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-xl space-y-12 mx-auto  ">
        <div className="border border-base-300/20 w-full p-1 py-3 shadow-xs bg-transparent rounded">
          <div className="m-2">
            <div className="border-b border-base-300/20 pb-1 w-10/12">
              <h2 className="text-base font-semibold leading-7 text-secondary-content">
                Creation de reglement
              </h2>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-10">
              <div className="sm:col-span-4">
                <label
                  htmlFor="theme"
                  className="block text-sm   font-sm leading-6 text-secondary-content/50"
                >
                  Theme
                </label>
                <div className="mt-2">
                  <select
                    id="theme"
                    name="theme"
                    autoComplete="theme"
                    className="border border-base-300/20 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-primary  text-secondary-content "
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      ----
                    </option>
                    <option value="Environnement">Environnement </option>
                    <option value="Santé et sécurité au travail">
                      Santé et sécurité au travail
                    </option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="domain"
                  className="block text-sm   font-sm leading-6 text-secondary-content/50"
                >
                  Domain
                </label>
                <div className="mt-2">
                  <select
                    id="domain"
                    name="domain"
                    autoComplete="domain"
                    className="border border-base-300/20 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-primary  text-secondary-content "
                    value={reglement.domain}
                    onChange={handleInputChange}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      ----
                    </option>
                    {reglementDomains.map((domain) => (
                      <option key={domain.id} value={domain.domain_name}>
                        {domain.domain_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sm:col-span-4">
                <label
                  htmlFor="type"
                  className="block text-sm   font-sm leading-6 text-secondary-content/50"
                >
                  Type
                </label>
                <div className="mt-2">
                  <select
                    id="type"
                    name="type"
                    autoComplete="type"
                    className="border border-base-300/20 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-primary  text-secondary-content "
                    value={reglement.type}
                    onChange={handleInputChange}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      ----
                    </option>
                    {reglementTypes.map((reglement) => (
                      <option key={reglement.id} value={reglement.type_name}>
                        {reglement.type_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="publicationDate"
                  className="block text-sm   font-sm leading-6 text-secondary-content/50"
                >
                  Date de publication
                </label>
                <div className="mt-5">
                  <input
                    id="publicationDate"
                    name="publicationDate"
                    type="date"
                    className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                    value={reglement.publicationDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="ref"
                  className="block text-sm   font-sm leading-6 text-secondary-content/50"
                >
                  Reference
                </label>
                <div className="mt-2">
                  <input
                    id="ref"
                    name="ref"
                    type="text"
                    autoComplete="given-name"
                    className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                    value={reglement.ref}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="title"
                  className="block text-sm   font-sm leading-6 text-secondary-content/50"
                >
                  Title
                </label>
                <div className="mt-2">
                  <input
                    id="title"
                    name="title"
                    type="text"
                    // autoComplete="family-name"
                    className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                    value={reglement.title}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-full tags-input-container">
                <label
                  htmlFor="administratif_general"
                  className="block text-sm   font-sm leading-6 text-secondary-content/50"
                >
                  Adminstratif general
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
                    ----
                  </option>
                  {administratisG.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.admin_general_name}
                    </option>
                  ))}
                </select>

                <div className="tags-display flex flex-wrap p-2 border-2 mt-1 rounded-lg space-x-2 gap-y-2 min-h-16">
                  {selectedAdministratifG.map((id, index) => {
                    const admin = administratisG.find(
                      (admin) => admin.id === id
                    );
                    return (
                      <div
                        className="tag-item rounded-md bg-base-100 p-2 "
                        key={index}
                      >
                        <span className="text text-sm ">
                          {admin ? admin.admin_general_name : "Unknown"}
                        </span>
                        <span
                          className="text-sm close rounded-full ml-1 cursor-pointer p-1"
                          onClick={() => removeTag(id)}
                        >
                          ×
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mx-2 mt-7 flex items-center justify-end gap-x-2 ">
            <button
              type="button"
              onClick={handleResetInputs}
              className="focus:ring-2 focus:ring-offset-2 focus:ring-neutral/80 bg-neutral/90 focus:outline-none transition duration-150 ease-in-out hover:bg-neutral-300 rounded text-base-content px-8 py-2 text-sm "
            >
              Reset
            </button>
            <button
              type="submit"
              className="focus:ring-2 focus:ring-offset-2 focus:ring-primary bg-primary focus:outline-none transition duration-150 ease-in-out hover:bg-primary/90 rounded text-primary-content px-8 py-2 text-sm  flex"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                />
              </svg>
              Save
            </button>
          </div>
        </div>
      </div>
      {isError && <ErrorAlert message={message} />}
      {isSuccess && <SuccessAlert message={message} />}
    </form>
  );
};

export default ReglementCreate;
