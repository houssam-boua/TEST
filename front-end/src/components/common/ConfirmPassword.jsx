import React, { useState } from "react";
import { confirmNewPassword } from "../../api/api";
import { useParams } from "react-router-dom";

const ConfirmPassword = () => {
  const { id } = useParams();
  const [user, setUser] = useState({
    new_password: "",
    confirm_password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Fixed: Call the function

    if (user.new_password !== user.confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await confirmNewPassword(id, user);
      if (response.success) {
        alert("Password updated successfully");
        window.location.href = "/"; // Redirect after success
      } else {
        alert("Error updating password");
      }
    } catch (error) {
      console.error("Error confirming password:", error);
    }
  };

  return (
    <div className="relative flex flex-col justify-start h-screen overflow-hidden">
      <div className="w-full p-5 m-auto bg-white rounded-lg shadow-xl lg:max-w-lg mt-10">
        <div className="logo flex justify-center mb-4">
          {/* <img src={"/sorec-logo.png"} alt="SORECT Inc." className="w-40" /> */}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col mb-6">
            <label
              htmlFor="new_password"
              className="pb-2 text-sm  font-bold text-gray-800"
            >
              Nouveau mot de passe
            </label>
            <input
              id="new_password"
              name="new_password"
              type="text"
              className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
              value={user.new_password}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col mb-6">
            <label
              htmlFor="confirm_password"
              className="pb-2 text-sm  font-bold text-gray-800"
            >
              Confirmer mot de passe
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="text"
              className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
              value={user.confirm_password}
              onChange={handleInputChange}
            />
          </div>

          <button
            id="login-button"
            type="submit"
            className="focus:ring-2 focus:ring-offset-2 focus:ring-primary bg-primary focus:outline-none transition duration-150 ease-in-out hover:bg-primary/90 rounded text-primary-content px-8 py-2 text-sm   w-full flex items-center justify-center"
            // disabled={isLoading}
          >
            Continuer
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4 ml-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConfirmPassword;
