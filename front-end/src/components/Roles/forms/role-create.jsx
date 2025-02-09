import React, { useState } from "react";
import { createRole } from "../../../api/api";
import successOperation from "../../../hooks/successOperation";

const CreateRole = ({onSuccess}) => {
  const [isSucess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");

  const [role, setRole] = useState({
    roleName: "",
    roleDescription: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await createRole(role);
      if (response.success) {
        setIsSuccess(true);
        successOperation(true);
        setMessage(response.message);
        if (onSuccess) onSuccess(); // Notify parent of success
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  const handleInputChange = (e) => {
    setRole({
      ...role,
      [e.target.name]: e.target.value,
    });
  };

  const handleReset = () => {
    setRole({
      roleName: "",
      roleDescription: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-2xl space-y-10 mx-auto  ">
        <div className="border border-base-300/20 w-full p-3 shadow-xs bg-transparent rounded">
          <div className="mt-7 grid  gap-x-2 gap-y-12 sm:grid-cols-12">
            <div className="sm:col-span-4 ">
              <label
                htmlFor="roleName"
                className="block text-sm  leading-6 text-secondary-content/60"
              >
                Nom
              </label>
              <div className="mt-2">
                <input
                  id="roleName"
                  name="roleName"
                  type="text"
                  className="border-b border-base-300/20 w-full pl-1 py-1 bg-transparent text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={role.roleName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="sm:col-span-8">
              <label
                htmlFor="roleDescription"
                className="block text-sm  leading-6 text-secondary-content/60"
              >
                Description
              </label>
              <div className="mt-2">
                <input
                  id="roleDescription"
                  name="roleDescription"
                  type="text"
                  className="border-b border-base-300/20 w-full pl-1 py-1 bg-transparent text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={role.roleDescription}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Buttons aligned to the bottom-right */}
          <div className="mt-5 flex justify-end gap-x-2">
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

export default CreateRole;
