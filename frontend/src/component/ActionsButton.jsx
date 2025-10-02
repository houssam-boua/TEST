import React from 'react';
import { Button } from '../components/ui/button';

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
      <Button
        onClick={onSubmit}
        disabled={submitDisabled}
        variant='default'
        className='flex-1 font-medium'
      >
        {submitLabel}
      </Button>
      <Button
        onClick={onDelete}
        disabled={deleteDisabled}
        variant='outline'
        className='flex-1 font-medium'
      >
        {deleteLabel}
      </Button>
    </div>
  );
};

export default ActionButtons;
