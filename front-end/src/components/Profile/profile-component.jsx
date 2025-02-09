import React, { useEffect, useState } from "react";
import { fetchUserById, updateUser } from "../../api/api";
import { useParams } from "react-router-dom";

const Profile = () => {
  const { userId } = useParams();
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(
    "https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg" // Default image URL
  );

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

  useEffect(() => {
    const fetchingUserById = async () => {
      try {
        const fetchedUser = await fetchUserById(userId);
        setUser({
          firstName: fetchedUser.first_name,
          lastName: fetchedUser.last_name,
          matricule: fetchedUser.matricule,
          phone: fetchedUser.phone,
          role: fetchedUser.role_name,
          statut: "1",
          email: fetchedUser.email,
          site: fetchedUser.site_name,
        });
      } catch (error) {
        console.error("Failed to fetch user by id");
      }
    };
    fetchingUserById();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call the API to create a new user
      const response = await updateUser(user, userId);
      console.log("API Response: ", response);
      setIsError(false);
      setIsSuccess(true);
      setMessage("User updated successfully");
    } catch (error) {
      console.error(error);
      setIsError(true);
      setIsSuccess(false);
      setMessage(error.response.data.message);
    }
  };

  return (
    // this is the form for creating a new user
    // it contains 3 parts
    // 1. Personal information
    // 2. Professional information
    // 3. Identification information

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
                htmlFor="firstName"
                className="block text-sm   font-sm leading-6 text-secondary-content/50"
              >
                Nom
              </label>
              <div className="mt-2">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={user.firstName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Prenom */}
            <div className="sm:col-span-3">
              <label
                htmlFor="lastName"
                className="block text-sm   font-sm leading-6 text-secondary-content/50"
              >
                Prenom
              </label>
              <div className="mt-2">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={user.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* cin */}
            <div className="sm:col-span-2">
              <label
                htmlFor="matricule"
                className="block text-sm   font-sm leading-6 text-secondary-content/50"
              >
                Cin
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

            {/* Ville */}
            <div className="sm:col-span-2">
              <label
                htmlFor="site"
                className="block text-sm   font-sm leading-6 text-secondary-content/50"
              >
                Site
              </label>
              <div className="mt-2">
                <input
                  id="site"
                  name="site"
                  type="text"
                  className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={user.site}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/*             Les Informations d'identification
         */}
        <div className="m-4">
          <div className="border-b border-base-300/20 pb-1 w-10/12">
            <h2 className="text-base font-semibold leading-7 text-secondary-content">
              Les
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="email"
                className="block text-sm   font-sm leading-6 text-secondary-content/50"
              >
                E-mail
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={user.email}
                  onChange={handleInputChange}
                />
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
                <input
                  id="role"
                  name="role"
                  type="role"
                  className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={user.role}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>
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
    </form>
  );
};

export default Profile;
