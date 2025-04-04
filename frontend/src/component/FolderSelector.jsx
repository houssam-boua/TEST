import React from "react";

const FolderSelector = ({
  label = 'Folder',
  required = false,
  options = [],
  className = '',
}) => {
  return (
    <fieldset className={`fieldset mt-2 ${className}`}>
      <legend className='fieldset-legend'>
        {label}{' '}
        {required && <span className='fieldset-label text-error'>(*)</span>}
      </legend>
      <select className='select w-full'>
        <option disabled={true}>----</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </fieldset>
  );
};

export default FolderSelector;
