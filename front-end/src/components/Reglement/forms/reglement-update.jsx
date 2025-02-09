import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import { ErrorAlert, SuccessAlert } from "../../shared/Alerts";
import {
  fetchDomainByThemes,
  fetchReglementById,
  fetchReglementTypes,
  updateReglement,
} from "../../../api/api";

const ReglementUpdate = () => {
  const { id } = useParams(); // Get the reglement ID from the URL
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const [reglementTypes, setReglementTypes] = useState([]);
  const [reglementDomains, setReglementDomain] = useState([]);

  const [reglement, setReglement] = useState({
    type: "",
    domain: "",
    ref: "",
    title: "",
    publicationDate: "",
    theme: "",
  });

  // Fetch reglement types and domains
  useEffect(() => {
    const fetchReglementType = async () => {
      try {
        const types = await fetchReglementTypes();
        setReglementTypes(types);
        console.log("Reglement types:", types);
      } catch (error) {
        console.error("Error fetching reglement types or :", error);
      }
    };
    fetchReglementType();
  }, []);

  useEffect(() => {
    const fetchReglementDomainBytheme = async () => {
      try {
        const reglementDomainData = await fetchDomainByThemes(reglement.theme);
        setReglementDomain(reglementDomainData);
      } catch (error) {
        console.error("Error fetching reglement domain data:", error);
      }
    };
    fetchReglementDomainBytheme();
  }, [reglement.theme]);

  // Fetch the reglement data by ID
  useEffect(() => {
    const fetchReglement = async () => {
      try {
        const fetchedReglement = await fetchReglementById(id);
        setReglement({
          type: fetchedReglement.data[0].type_name,
          domain: fetchedReglement.data[0].domain_name,
          ref: fetchedReglement.data[0].regulation_ref,
          title: fetchedReglement.data[0].regulation_title,
          publicationDate: fetchedReglement.data[0].publication_date,
          theme: fetchedReglement.data[0].theme_name,
        });
        setIsLoading(false); // Data fetched, stop loading
      } catch (error) {
        console.error("Failed to fetch reglement data", error);
        setIsError(true);
        setIsLoading(false); // Stop loading even on error
      }
    };
    fetchReglement();
  }, [id]);

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
      const response = await updateReglement(reglement, id);
      setIsError(false);
      setIsSuccess(true);
      setMessage("Reglement updated successfully");
    } catch (error) {
      setIsError(true);
      setIsSuccess(false);
      setMessage("Failed to update reglement");
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <span className="loading loading-ring loading-lg text-primary"></span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="max-w-xl space-y-12 mx-auto  ">
            <div className="border border-base-300/20 w-full p-1 py-3 shadow-xs bg-transparent rounded">
              <div className="m-2">
                <div className="border-b border-base-300/20 pb-1 w-10/12">
                  <h2 className="text-base font-semibold leading-7 text-secondary-content">
                    Edit Regulation
                  </h2>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-6">
                  {/* Reference */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="ref"
                      className="block text-sm  font-medium leading-6 text-gray-600"
                    >
                      Reference
                    </label>
                    <div className="mt-2">
                      <input
                        id="ref"
                        name="ref"
                        type="text"
                        className="border-b border-b-gray-300 w-full pl-1 py-1 bg-transparent text-sm  focus:outline-none focus:border-b-indigo-700 placeholder-gray-500 text-gray-600 transition-colors duration-200 ease-in-out"
                        value={reglement.ref}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="title"
                      className="block text-sm  font-medium leading-6 text-gray-600"
                    >
                      Title
                    </label>
                    <div className="mt-2">
                      <input
                        id="title"
                        name="title"
                        type="text"
                        className="border-b border-b-gray-300 w-full pl-1 py-1 bg-transparent text-sm  focus:outline-none focus:border-b-indigo-700 placeholder-gray-500 text-gray-600 transition-colors duration-200 ease-in-out"
                        value={reglement.title}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Type */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="type"
                      className="block text-sm  font-medium leading-6 text-gray-600"
                    >
                      Type
                    </label>
                    <div className="mt-2">
                      <select
                        id="type"
                        name="type"
                        className="border border-gray-300 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-indigo-700 placeholder-gray-500 text-gray-600"
                        value={reglement.type}
                        onChange={handleInputChange}
                      >
                        <option value="" disabled>
                          Select Type
                        </option>
                        {reglementTypes.map((regType) => (
                          <option key={regType.id} value={regType.type_name}>
                            {regType.type_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
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
                        value={reglement.theme}
                        onChange={handleInputChange}
                      >
                        <option value="" disabled>
                          Saisir le type
                        </option>
                        <option value="Environnement">Environnement </option>
                        <option value="Santé et sécurité au travail">
                          Santé et sécurité au travail
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Domain */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="domain"
                      className="block text-sm  font-medium leading-6 text-gray-600"
                    >
                      Domain
                    </label>
                    <div className="mt-2">
                      <select
                        id="domain"
                        name="domain"
                        className="border border-gray-300 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-indigo-700 placeholder-gray-500 text-gray-600"
                        value={reglement.domain}
                        onChange={handleInputChange}
                      >
                        <option value="" disabled>
                          Select Domain
                        </option>
                        {reglementDomains.map((domain) => (
                          <option key={domain.id} value={domain.domain_name}>
                            {domain.domain_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Publication Date */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="publicationDate"
                      className="block text-sm  font-medium leading-6 text-gray-600"
                    >
                      Publication Date
                    </label>
                    <div className="mt-2">
                      <input
                        id="publicationDate"
                        name="publicationDate"
                        type="date"
                        className="border-b border-b-gray-300 w-full pl-1 py-1 bg-transparent text-sm  focus:outline-none focus:border-b-indigo-700 placeholder-gray-500 text-gray-600 transition-colors duration-200 ease-in-out"
                        value={reglement.publicationDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="m-3 flex items-center justify-end gap-x-6 my-1">
                <button
                  type="button"
                  className="focus:ring-2 focus:ring-offset-2 focus:ring-neutral-600 bg-neutral-200 focus:outline-none transition duration-150 ease-in-out hover:bg-neutral-300 rounded text-gray-800 px-8 py-2 text-sm "
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 bg-indigo-600 focus:outline-none transition duration-150 ease-in-out hover:bg-indigo-500 rounded text-white px-8 py-2 text-sm "
                >
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* Success and Error Messages */}
          {isError && <ErrorAlert message={message} />}
          {isSuccess && <SuccessAlert message={message} />}
        </form>
      )}
    </>
  );
};

export default ReglementUpdate;
