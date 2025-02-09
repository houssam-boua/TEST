import React from "react";

function YesNoModal({
  title,
  Question,
  YesTitle,
  NoTitle,
  handleYes,
  handleNo,
}) {
  return (
    <div className="modal modal-open ">
      <div className="modal-box">
        <h3 className="font-bold text-md pb-3">{title}</h3>
        <p className="block text-md leading-6 text-secondary-content/80">
          {Question}
        </p>
        <div className="modal-action">
          <button
            className="bg-primary text-primary-content px-8 py-2 text-sm  rounded hover:bg-primary/90 flex align-middle justify-center"
            onClick={handleYes}
          >
            {YesTitle}
          </button>

          <button
            className="bg-neutral/90 text-base-content px-8 py-2 text-sm  rounded hover:bg-neutral-300"
            onClick={handleNo}
          >
            {NoTitle}
          </button>
        </div>
      </div>
    </div>
  );
}

export default YesNoModal;
