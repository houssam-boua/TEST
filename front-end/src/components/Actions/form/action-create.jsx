import React, { useEffect, useState } from "react";
import {
  fetchActionPriority,
  fetchActionStatus,
  fetchUsersData,
} from "../../../api/api";

function ActionCreate({ conformityId, onSaveAction }) {
  const [action, setAction] = useState({
    conformity_id: conformityId,
    action_status_id: "",
    action_priority_id: "",
    action_launch_date: "",
    action_due_date: "",
    action_description: "",
    responsable_account_id: "",
  });
  const [status, setStatus] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetchActionStatus();
        setStatus(response);
      } catch (error) {
        console.error("Error fetching status data:", error);
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    const fetchPriority = async () => {
      try {
        const response = await fetchActionPriority();
        setPriorities(response);
      } catch (error) {
        throw error;
      }
    };
    fetchPriority();
  }, []);

  useEffect(() => {
    const fetchResponsibles = async () => {
      try {
        const response = await fetchUsersData();
        setResponsables(response.accounts);
      } catch (error) {
        throw error;
      }
    };
    fetchResponsibles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAction({
      ...action,
      [name]: value,
    });
  };

  const handleSave = () => {
    if (onSaveAction) {
      onSaveAction(action); // Send the action to the parent component
    }
  };

  return (
    <>
      <div className="max-w-xl space-y-6 mx-auto">
        <div className="border border-base-300/20 w-full p-3 shadow-xs bg-transparent rounded">
          <div className="mt-7 grid gap-x-5 gap-y-3 sm:grid-cols-6">
            <div className="sm:col-span-3 tags-input-container">
              <label
                htmlFor="action_status_id"
                className="block text-sm leading-6 text-secondary-content/60"
              >
                Statut
              </label>
              <div className="tags-display flex flex-wrap">
                <select
                  id="action_status_id"
                  name="action_status_id" // Ensure this is the correct name
                  className="border border-base-300/20 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-primary text-secondary-content"
                  value={action.action_status_id} // Bind value to reglementId
                  onChange={handleInputChange}
                  defaultValue=""
                >
                  <option value="" disabled>
                    ----
                  </option>
                  {status.map((stat) => (
                    <option key={stat.id} value={stat.id}>
                      {stat.action_status_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3 tags-input-container">
              <label
                htmlFor="action_priority_id"
                className="block text-sm leading-6 text-secondary-content/60"
              >
                Priority
              </label>
              <div className="tags-display flex flex-wrap">
                <select
                  id="action_priority_id"
                  name="action_priority_id" // Ensure this is the correct name
                  className="border border-base-300/20 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-primary text-secondary-content"
                  value={action.action_priority_id} // Bind value to reglementId
                  onChange={handleInputChange}
                >
                  <option value="" disabled>
                    ----
                  </option>
                  {priorities.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.action_priority_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-full tags-input-container">
              <label
                htmlFor="responsable_account_id"
                className="block text-sm leading-6 text-secondary-content/60"
              >
                Responsable
              </label>
              <div className="tags-display flex flex-wrap">
                <select
                  id="responsable_account_id"
                  name="responsable_account_id" // Ensure this is the correct name
                  className="border border-base-300/20 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-primary text-secondary-content"
                  value={action.responsable_account_id} // Bind value to reglementId
                  onChange={handleInputChange}
                >
                  <option value="" disabled>
                    ----
                  </option>
                  {responsables.map((responsable) => (
                    <option key={responsable.id} value={responsable.id}>
                      {responsable.first_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="action_launch_date"
                className="block text-sm   font-sm leading-6 text-secondary-content/50"
              >
                Date de publication
              </label>
              <div className="mt-2">
                <input
                  id="action_launch_date"
                  name="action_launch_date"
                  type="date"
                  className="border-b border-b-gray-300 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-indigo-700 placeholder-gray-500 text-gray-600 transition-colors duration-200 ease-in-out"
                  value={action.action_launch_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="action_due_date"
                className="block text-sm   font-sm leading-6 text-secondary-content/50"
              >
                Date de publication
              </label>
              <div className="mt-2">
                <input
                  id="action_due_date"
                  name="action_due_date"
                  type="date"
                  className="border-b border-b-gray-300 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-indigo-700 placeholder-gray-500 text-gray-600 transition-colors duration-200 ease-in-out"
                  value={action.action_due_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="sm:col-span-full">
              <label
                htmlFor="action_description"
                className="block text-sm  leading-6 text-secondary-content/60"
              >
                Description
              </label>
              <div className="mt-2">
                <textarea
                  id="action_description"
                  name="action_description"
                  rows="4"
                  className="textarea textarea-ghost textarea-sm border-b border-base-300/20 w-full pl-1 py-1 bg-transparent text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                  value={action.action_description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end ">
        <button
          type="submit"
          className="bg-primary text-primary-content px-8 py-2 text-sm  rounded hover:bg-primary/90 flex"
          onClick={handleSave}
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
    </>
  );
}

export default ActionCreate;
