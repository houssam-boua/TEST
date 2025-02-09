import React, { useEffect, useState } from "react";
import {
  createUser,
  fetchAdministratif,
  fetchReglementDomainsadministratif,
  fetchRoles,
} from "../../../api/api";
import { ErrorAlert, SuccessAlert } from "../../shared/Alerts";

const UserCreation = () => {
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [sites, setSites] = useState([]);
  const [administratif, setAdministratif] = useState([]);
  const [roles, setRoles] = useState([]);
  const [administratifSelected, setAdministratifSelected] = useState("");

  useEffect(() => {
    const fetchAdministratifData = async () => {
      try {
        const administratifData = await fetchAdministratif();
        console.log("l'administratif data : ", administratifData);
        setAdministratif(administratifData);
      } catch (error) {
        console.error("Error fetching administratif data:", error);
      }
    };
    fetchAdministratifData();
  }, []);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        // Call the API to fetch the sites
        const sitesData = await fetchReglementDomainsadministratif(
          administratifSelected
        );
        console.log("sitesData ", sitesData);

        if (sitesData) {
          console.log("Sites: ", sitesData); // Log the sites data
          setSites(sitesData); // Set the sites state
        } else {
          console.error("Failed to fetch sites: No data returned");
        }
      } catch (error) {
        console.error("Error fetching sites: ", error); // More context in the error log
      }
    };

    fetchSites();
  }, [administratifSelected]);

  useEffect(() => {
    const fetchRolesData = async () => {
      try {
        const rolesData = await fetchRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error("Error fetching roles data:", error);
      }
    };
    fetchRolesData();
  }, []);

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    matricule: "",
    phone: "",
    statut: "1",
    email: "",
    role: "",
    site: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const resetUser = () =>{
    setUser({
      firstName: "",
      lastName: "",
      matricule: "",
      phone: "",
      statut: "1",
      email: "",
      role: "",
      site: "",
    });  }

  const handleReset = (e) => {
    e.preventDefault();
    resetUser()
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("console dyal user ", user);
      const response = await createUser(user);
      setIsError(false);
      setIsSuccess(true);
      setMessage("User created successfully");
      resetUser();
    } catch (error) {
      console.error(error);
      setIsError(true);
      setIsSuccess(false);
      setMessage(error.response.data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-2xl space-y-12 m-3 border border-base-300/20 shadow-xs w-full pl-3 py-3 bg-transparent rounded  ">
        <div className="m-4">
          <div className="border-b border-base-300/20 pb-1 w-10/12">
            <h2 className="text-base font-semibold leading-7 text-secondary-content">
              Les Informations personnels
            </h2>
          </div>

          {/* User photo */}
          <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* Nom */}
            <div className="sm:col-span-3">
              <label
                htmlFor="firstName"
                className="block text-sm  font-sm leading-6 text-secondary-content/50"
              >
                Nom
              </label>
              <div className="mt-2">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={user.firstName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Prenom */}
            <div className="sm:col-span-3">
              <label
                htmlFor="lastName"
                className="block text-sm  font-sm leading-6 text-secondary-content/50"
              >
                Prenom
              </label>
              <div className="mt-2">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={user.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* matricule */}
            <div className="sm:col-span-3">
              <label
                htmlFor="matricule"
                className="block text-sm  font-sm leading-6 text-secondary-content/50"
              >
                Matricule
              </label>
              <div className="mt-2">
                <input
                  id="matricule"
                  name="matricule"
                  type="text"
                  className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={user.matricule}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Telephone */}
            <div className="sm:col-span-3">
              <label
                htmlFor="phone"
                className="block text-sm  font-sm leading-6 text-secondary-content/50"
              >
                Telephone
              </label>
              <div className="mt-2">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={user.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="email"
                className="block text-sm  font-sm leading-6 text-secondary-content/50"
              >
                E-mail
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={user.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/*             Les Informations professionels
         */}

        <div className="m-4">
          <div className="border-b border-base-300/20 pb-1 w-10/12">
            <h2 className="text-base font-semibold leading-7 text-secondary-content">
              Les Informations professionels
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="administratif"
                className="block text-sm  font-sm leading-6 text-secondary-content/50"
              >
                Administratif
              </label>
              <div className="mt-2">
                <select
                  id="administratif"
                  name="administratif"
                  className="border border-gray-300 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm focus:outline-none focus:border-indigo-700 placeholder-gray-500 text-secondary-content "
                  value={administratifSelected}
                  onChange={(e) => setAdministratifSelected(e.target.value)}
                >
                  <option value="" disabled>
                    ---{" "}
                  </option>

                  {administratif.map((admin) => (
                    <option key={admin.id} value={admin.administratif_name}>
                      {admin.administratif_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="site"
                className="block text-sm  font-sm leading-6 text-secondary-content/50"
              >
                Site
              </label>
              <div className="mt-2">
                <select
                  id="site"
                  name="site"
                  autoComplete="site"
                  className="border border-gray-300 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm focus:outline-none focus:border-indigo-700 placeholder-gray-500 text-secondary-content "
                  value={user.site}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>
                    ----{" "}
                  </option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.site_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="role"
                className="block text-sm  font-sm leading-6 text-secondary-content/50"
              >
                Role
              </label>
              <div className="mt-2">
                <select
                  id="role"
                  name="role"
                  autoComplete="role"
                  className="border border-gray-300 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm focus:outline-none focus:border-indigo-700 placeholder-gray-500 text-secondary-content "
                  value={user.role}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>
                    ----
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/*             Les Informations d'identification
         */}

        <div className="m-3 flex items-center justify-end gap-x-2 my-1">
          <button
            type="button"
            className="focus:ring-2 focus:ring-offset-2 focus:ring-neutral/80 bg-neutral/90 focus:outline-none transition duration-150 ease-in-out hover:bg-neutral-300 rounded text-base-content px-8 py-2 text-sm"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            type="submit"
            className="focus:ring-2 focus:ring-offset-2 focus:ring-primary bg-primary focus:outline-none transition duration-150 ease-in-out hover:bg-primary/90 rounded text-primary-content px-8 py-2 text-sm flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5 mr-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
            Save
          </button>
        </div>
      </div>

      {isError && <ErrorAlert message={message} />}
      {isSuccess && <SuccessAlert message={message} />}
    </form>
  );
};

export default UserCreation;
