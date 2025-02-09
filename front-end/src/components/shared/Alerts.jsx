import React, { useEffect, useState } from "react";

// Error Alert Component
export const ErrorAlert = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Set a timeout to hide the alert after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose(); // Call the onClose callback if provided
    }, 5000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="toast toast-end text-sm  login_button_container ">
      <div className="alert alert-error">
        <span>{message}</span>
      </div>
    </div>
  );
};

// Success Alert Component
export const SuccessAlert = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Set a timeout to hide the alert after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose(); // Call the onClose callback if provided
    }, 5000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="toast toast-end text-sm ">
      <div className="alert alert-info">
        <span>{message}</span>
      </div>
    </div>
  );
};
