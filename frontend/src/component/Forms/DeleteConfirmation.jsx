// components/forms/DeleteConfirmation.jsx
import React from 'react';

const DeleteConfirmation = ({ itemName }) => {
  return (
    <div>
      <p>
        Êtes-vous sûr de vouloir supprimer <strong>{itemName}</strong> ?
      </p>
      <p className='text-error mt-2'>Cette action est irréversible.</p>
    </div>
  );
};

export default DeleteConfirmation;
