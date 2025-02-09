import React from "react";

const DeleteModal = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-sm ">Confirm Deletion</h3>
        <p>
          {message || "Are you sure you want to delete the selected items?"}
        </p>
        <div className="modal-action">
          <button className="btn btn-primary" onClick={onConfirm}>
            Yes, Delete
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
