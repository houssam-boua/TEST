import React, { useEffect, useState } from "react";
import { createNorms, fetchNormById, updateNorm } from "../../../api/api";
import { ErrorAlert, SuccessAlert } from "../../shared/Alerts";
import { useParams } from "react-router-dom";

const NormUpdate = () => {
  const { normId } = useParams();
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [norm, setNorm] = useState({
    ref: "",
    abbrev: "",
    nom: "",
    version: "",
    publicationDate: "",
    developedBy: "",
  });

  useEffect(() => {
    const fetchNorm = async () => {
      try {
        const normData = await fetchNormById(normId);
        console.log("normData", normData);
        setNorm({
          ref: normData.norm_ref,
          abbrev: normData.norm_abbreviation_name,
          nom: normData.norm_complet_name,
          version: normData.norm_version,
          publicationDate: normData.norm_pub_date,
          developedBy: normData.norm_developed_with,
        });
      } catch (error) {
        console.error("failed to fetch norms data ");
      }
    };
    fetchNorm();
  }, [normId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNorm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("reglement ha houwa: ", norm);

    try {
      const response = await updateNorm(norm, normId);
      setIsError(false);
      setIsSuccess(true);
      setMessage("reglement created successfully");
    } catch (error) {
      setIsError(true);
      setIsSuccess(false);
      setMessage("Failed to create reglement");
      console.error("Failed to create reglement", error);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-xl space-y-12 mx-auto  ">
        <div className="border border-base-300/20 w-full p-1 py-3 shadow-xs bg-transparent rounded">
          <div className="m-2">
            <div className="border-b border-base-300/20 pb-1 w-10/12">
              <h2 className="text-base font-semibold leading-7 text-secondary-content">
                Ajouter une norme
              </h2>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-6">
              <div className="sm:col-span-2">
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
                    type="number"
                    // autoComplete="given-name"
                    className="border-b border-b-gray-300 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-indigo-700 placeholder-gray-500 text-gray-600 transition-colors duration-200 ease-in-out"
                    value={norm.ref}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="abbrev"
                  className="block text-sm   font-sm leading-6 text-secondary-content/50"
                >
                  Abbreviation
                </label>
                <div className="mt-2">
                  <input
                    id="abbrev"
                    name="abbrev"
                    type="text"
                    // autoComplete="family-name"
                    className="border-b border-b-gray-300 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-indigo-700 placeholder-gray-500 text-gray-600 transition-colors duration-200 ease-in-out"
                    value={norm.abbrev}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="version"
                  className="block text-sm   font-sm leading-6 text-secondary-content/50"
                >
                  Version
                </label>
                <div className="mt-2">
                  <input
                    id="version"
                    name="version"
                    type="text"
                    autoComplete="version"
                    className="border-b border-b-gray-300 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-indigo-700 placeholder-gray-500 text-gray-600 transition-colors duration-200 ease-in-out"
                    value={norm.version}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="nom"
                  className="block text-sm   font-sm leading-6 text-secondary-content/50"
                >
                  Nom complet
                </label>
                <div className="mt-2">
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    autoComplete="nom"
                    className="border-b border-b-gray-300 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-indigo-700 placeholder-gray-500 text-gray-600 transition-colors duration-200 ease-in-out"
                    value={norm.nom}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="publicationDate"
                  className="block text-sm   font-sm leading-6 text-secondary-content/50"
                >
                  Date de publication
                </label>
                <div className="mt-2">
                  <input
                    id="publicationDate"
                    name="publicationDate"
                    type="date"
                    className="border-b border-b-gray-300 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-indigo-700 placeholder-gray-500 text-gray-600 transition-colors duration-200 ease-in-out"
                    value={norm.publicationDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="developedBy"
                  className="block text-sm   font-sm leading-6 text-secondary-content/50"
                >
                  Developee par
                </label>
                <div className="mt-2">
                  <input
                    id="developedBy"
                    name="developedBy"
                    type="text"
                    className="border-b border-b-gray-300 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-indigo-700 placeholder-gray-500 text-gray-600 transition-colors duration-200 ease-in-out"
                    value={norm.developedBy}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mx-2 mt-7 flex items-center justify-end gap-x-6 ">
            <button
              type="button"
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

export default NormUpdate;
