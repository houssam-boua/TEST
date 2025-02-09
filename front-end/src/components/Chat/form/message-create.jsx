import React, { useState } from "react";
import { sendConsultation } from "../../../api/api";
import { ErrorAlert, SuccessAlert } from "../../shared/Alerts";

function MessageCreate() {
  const [consultation, setConsultation] = useState({
    object: "",
    consultantEmail: "ramaqshse@gmail.com",
    contentEmail: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    setConsultation({
      ...consultation,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await sendConsultation(consultation);
      console.log(response);
      if (response.success) {
        setIsSuccess(true);
        setMessage(response.message);
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-xl space-y-10 mx-auto  ">
        <div className="border border-base-300/20 w-full p-3 shadow-xs bg-transparent rounded">
          <div className="m-2 grid  gap-x-2 gap-y-12 ">
            <div>
              <h2 className="text-base font-semibold leading-7 text-secondary-content">
                Nouveau Consultation
              </h2>

              <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-10">
                <div className="sm:col-span-full">
                  <label
                    htmlFor="object"
                    className="block text-sm   font-sm leading-6 text-secondary-content/50"
                  >
                    Objet
                  </label>
                  <div className="">
                    <input
                      id=""
                      name="object"
                      type="text"
                      className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                      value={consultation.object}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* <div className="sm:col-span-full">
                  <label
                    htmlFor="consultantEmail"
                    className="block text-sm   font-sm leading-6 text-secondary-content/50"
                  >
                    Consultant
                  </label>
                  <div className="">
                    <input
                      id=""
                      name="consultantEmail"
                      type="text"
                      className="border-b border-base-300/20 w-full pl-1 py-1  bg-transparent  text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                      value={consultation.consultantEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div> */}
                <div className="sm:col-span-full">
                  <label
                    htmlFor="contentEmail"
                    className="block text-sm   font-sm leading-6 text-secondary-content/50"
                  >
                    Description
                  </label>
                  <div className="">
                    <textarea
                      id="contentEmail"
                      name="contentEmail"
                      rows="4"
                      className="textarea textarea-ghost textarea-sm border-b border-base-300/20 w-full pl-1 py-1 bg-transparent text-sm  focus:outline-none focus:border-b-accent text-secondary-content transition-colors duration-200 ease-in-out"
                      value={consultation.contentEmail}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 flex justify-end gap-x-6">
            <button
              type="submit"
              className="bg-primary text-primary-content px-8 py-2 text-sm  rounded hover:bg-primary/90 flex flex-row items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 mr-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
              Envoyer
            </button>
          </div>
        </div>
      </div>
      {isSuccess && <SuccessAlert message={message} />}
      {isError && <ErrorAlert message={message} />}
    </form>
  );
}

export default MessageCreate;
