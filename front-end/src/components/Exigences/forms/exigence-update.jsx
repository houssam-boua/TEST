import React, { useEffect, useState } from "react";
import {
  editExigence,
  getExigenceById,
} from "../../../services/exigencesService";

const ExigenceUpadte = ({ exigenceId }) => {
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [exigenceData, setExigenceData] = useState({
    content: "",
    description: "",
    article: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await getExigenceById(exigenceId);
      console.log(response);
      setExigenceData({
        content: response.exigence_content,
        description: response.exigence_description,
        article: response.reglement_article,
      });
    };
    fetchData();
  }, [exigenceId]);

  const handleInputChange = (e) => {
    setExigenceData({
      ...exigenceData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await editExigence(exigenceData, exigenceId);

      if (response.success) {
        setIsSuccess(true);
        setMessage("Exigence created successfully!");
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

  const handleReset = (e) => {
    e.preventDefault();
    setExigenceData({
      content: "",
      description: "",
      article: "",
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
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
      </form>
    </>
  );
};

export default ExigenceUpadte;
