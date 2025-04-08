// components/Modal.jsx
import React from 'react';

const Modal = ({
  id,
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmColor = 'btn-primary',
}) => {
  // Close the modal when ESC is pressed or backdrop is clicked
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      id={id}
      className='modal modal-bottom sm:modal-middle'
      open={isOpen}
    >
      <div className='modal-box'>
        <h3 className='font-bold'>{title}</h3>
        <div className='py-4'>{children}</div>
        <div className='modal-action'>
          <form method='dialog' className='flex gap-2'>
            {/* Cancel button */}
            <button onClick={onClose} className='btn'>
              {cancelText}
            </button>
            {/* Confirm button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              className={`btn ${confirmColor}`}
            >
              {confirmText}
            </button>
          </form>
        </div>
      </div>

      {/* Backdrop click handler */}
      <form method='dialog' className='modal-backdrop'>
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default Modal;
