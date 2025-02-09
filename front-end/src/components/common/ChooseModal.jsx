import React from "react";

const ChooseModal = ({
  isOpen,
  onConfirm,
  modalTitle,
  message,
  handleInputChange,
  items,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-sm "> {modalTitle}</h3>
        <p>{message || "Veuillez choisir une option pour continuer"}</p>
        <div className="modal-action">
          <select
            id="role"
            name="role"
            autoComplete="role"
            className="border border-gray-300 w-full pl-3 py-3 shadow-sm bg-transparent rounded text-sm  focus:outline-none focus:border-indigo-700 placeholder-gray-500 text-secondary-content "
            value={"wayeh"}
            onChange={handleInputChange}
          >
            <option value="norm">Norme</option>
            <option value="reglement">Reglement</option>
          </select>

          <select>
            {items.map((item) => (
              <option value={item.id}>{item.norm_abbreviation_name}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={onConfirm}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseModal;
