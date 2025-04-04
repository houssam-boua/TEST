import React from 'react';

const ActionButtons = ({
  onSubmit,
  onDelete,
  submitDisabled = false,
  deleteDisabled = false,
  submitLabel = 'Submit',
  deleteLabel = 'Delete',
  className = '',
}) => {
  return (
    <div className={`mt-4 flex flex-col sm:flex-row gap-2 ${className}`}>
      <button
        onClick={onSubmit}
        disabled={submitDisabled}
        className='btn btn-primary flex-1/2 shadow-none disabled:opacity-50 font-medium'
      >
        {submitLabel}
      </button>
      <button
        onClick={onDelete}
        disabled={deleteDisabled}
        className='btn flex-1 shadow-none disabled:opacity-50 font-medium'
      >
        {deleteLabel}
      </button>
    </div>
  );
};

export default ActionButtons;
