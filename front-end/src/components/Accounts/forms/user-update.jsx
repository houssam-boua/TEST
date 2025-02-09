import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorAlert, SuccessAlert } from "../../shared/Alerts";
import {
  fetchAdministratif,
  fetchCities,
  fetchReglementDomainsadministratif,
  fetchRoles,
  fetchUserById,
  updateUser,
} from "../../../api/api";

const UserUpdate = () => {
  const { userId } = useParams();
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [sites, setSites] = useState([]);
  const [roles, setRoles] = useState([]);
  const [administratif, setAdministratif] = useState([]);
  const [administratifSelected, setAdministratifSelected] = useState("");
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchingUserById = async () => {
      try {
        const fetchedUser = await fetchUserById(userId);

        setUser({
          first_name: fetchedUser.first_name,
          last_name: fetchedUser.last_name,
          matricule: fetchedUser.matricule,
          phone: fetchedUser.phone,
          role: fetchedUser.role_id, // Ensure role is initialized
          email: fetchedUser.email,
          site: fetchedUser.site_id || "", // Ensure site is initialized
          statut: fetchedUser.statut || "1", // Default statut
        });
        setAdministratifSelected(fetchedUser.administratif_name);
      } catch (error) {
        console.error("Failed to fetch user by id:", error);
      }
    };
    fetchingUserById();
  }, [userId]);

  useEffect(() => {
    const fetchAdministratifData = async () => {
      try {
        const administratifData = await fetchAdministratif();
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
        const sitesData = await fetchReglementDomainsadministratif(
          administratifSelected
        );
        if (sitesData) {
          setSites(sitesData);
        } else {
          console.error("Failed to fetch sites: No data returned");
        }
      } catch (error) {
        console.error("Error fetching sites: ", error);
      }
    };

    fetchSites();
  }, [administratifSelected]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUser((prevState) => ({
      ...prevState,
      [name]: value !== undefined ? value : prevState[name], // Retain the existing value if no new value is set
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.site || !user.role) {
      setIsError(true);
      setIsSuccess(false);
      setMessage("Please select both site and role before submitting.");
      return;
    }

    try {
      const response = await updateUser(user, userId);
      console.log("response of updating user: ", response);
      setIsError(false);
      setIsSuccess(true);
      setMessage("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      setIsError(true);
      setIsSuccess(false);
      setMessage(error.response?.data?.message || "An error occurred");
    }
  };

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

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-2xl space-y-12 m-3 border border-base-300/20 w-full pl-3 py-3 shadow-xs bg-transparent rounded  ">
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
                htmlFor="first_name"
                className="block text-sm   font-sm leading-6 text-secondary-content/50"
              >
                Nom
              </label>
              <div className="mt-2">
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={user.first_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Prenom */}
            <div className="sm:col-span-3">
              <label
                htmlFor="last_name"
                className="block text-sm   font-sm leading-6 text-secondary-content/50"
              >
                Prenom
              </label>
              <div className="mt-2">
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={user.last_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* matricule */}
            <div className="sm:col-span-2">
              <label
                htmlFor="matricule"
                className="block text-sm   font-sm leading-6 text-secondary-content/50"
              >
                matricule
              </label>
              <div className="mt-2">
                <input
                  id="matricule"
                  name="matricule"
                  type="text"
                  autoComplete="matricule"
                  className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={user.matricule}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Telephone */}
            <div className="sm:col-span-3">
              <label
                htmlFor="phone"
                className="block text-sm   font-sm leading-6 text-secondary-content/50"
              >
                Telephone
              </label>
              <div className="mt-2">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="phone"
                  className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={user.phone}
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
                className="block text-sm   font-sm leading-6 text-secondary-content/50"
              >
                Administratif
              </label>
              <div className="mt-2">
                <select
                  id="administratif"
                  name="administratif"
                  className="border border-gray-300 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-indigo-700 placeholder-gray-500 text-secondary-content "
                  value={administratifSelected}
                  onChange={(e) => setAdministratifSelected(e.target.value)}
                >
                  <option value="" disabled>
                    Sélectionner le site
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
                className="block text-sm   font-sm leading-6 text-secondary-content/50"
              >
                Site
              </label>
              <div className="mt-2">
                <select
                  id="site"
                  name="site"
                  autoComplete="site"
                  className="border border-gray-300 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-indigo-700 placeholder-gray-500 text-secondary-content "
                  value={user.site}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>
                    Sélectionner le site
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
                className="block text-sm   font-sm leading-6 text-secondary-content/50"
              >
                Role
              </label>
              <div className="mt-2">
                <select
                  id="role"
                  name="role"
                  autoComplete="role"
                  className="border border-gray-300 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-indigo-700 placeholder-gray-500 text-secondary-content "
                  value={user.role}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>
                    Sélectionner un rôle
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

        <div className="m-3 flex items-center justify-end gap-x-6 my-1">
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

export default UserUpdate;
