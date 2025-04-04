import React from 'react';
const DescriptionField = ({
  label = 'Description',
  placeholder = '',
  className = '',
}) => {
  return (
    <fieldset className={`fieldset ${className}`}>
      <legend className='fieldset-legend'>{label}</legend>
      <textarea
        className='textarea h-24 w-full'
        placeholder={placeholder}
      ></textarea>
    </fieldset>
  );
};

export default DescriptionField;
