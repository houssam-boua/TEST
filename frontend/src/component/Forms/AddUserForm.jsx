import React from 'react';

const AddUserForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div className='space-y-4'>
      {/* Name Field */}
      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Nom et Prenom</span>
        </label>
        <input
          type='text'
          name='name'
          className='input input-bordered w-full'
          value={formData.name || ''}
          onChange={handleChange}
          required
        />
      </div>

      {/* Email Field */}
      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>E-mail</span>
        </label>
        <input
          type='email'
          name='email'
          className='input input-bordered w-full'
          value={formData.email || ''}
          onChange={handleChange}
          required
        />
      </div>

      {/* Password Field */}
      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Mot de passe</span>
        </label>
        <input
          type='password'
          name='password'
          className='input input-bordered w-full'
          value={formData.password || ''}
          onChange={handleChange}
          required
        />
      </div>

      {/* Role Selection */}
      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Role</span>
        </label>
        <select
          name='role'
          className='select select-bordered w-full'
          value={formData.role || ''}
          onChange={handleChange}
          required
        >
          <option value=''>Select a role</option>
          <option value='Admin'>Admin</option>
          <option value='User'>Utilisateur</option>
          <option value='Editor'>Validateur</option>
        </select>
      </div>

      {/* Send Credentials Checkbox */}
      <div className='form-control'>
        <label className='label cursor-pointer justify-start gap-2'>
          <input
            type='checkbox'
            name='sendCredentials'
            className='checkbox checkbox-sm'
            checked={formData.sendCredentials || false}
            onChange={handleChange}
          />
        <span className='label-text'>Envoyer ces informations par mail</span>
        </label>
      </div>
    </div>
  );
};

export default AddUserForm;
