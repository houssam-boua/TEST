import React from 'react';

const AddUserForm = ({ formData, setFormData }) => {
  return (
    <div className='space-y-4'>
      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Nom d'utilisateur</span>
        </label>
        <input
          type='text'
          className='input input-bordered w-full'
          value={formData.username || ''}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
        />
      </div>

      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Role</span>
        </label>
        <select
          className='select select-bordered w-full'
          value={formData.role || ''}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value=''>Sélectionner un role</option>
          <option value='Admin'>Admin</option>
          <option value='Utilisateur'>Utilisateur</option>
        </select>
      </div>
    </div>
  );
};

export default AddUserForm;
