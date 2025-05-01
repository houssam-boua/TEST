import React from 'react';

const TableCheckbox = ({ checked, onChange, className = '' }) => {
  return (
    <input
      type='checkbox'
      checked={checked}
      onChange={onChange}
      className={`checkbox checkbox-sm  w-4 h-4 transition duration-150 ease-in-out ${className}`}
    />
  );
};

export default TableCheckbox;
