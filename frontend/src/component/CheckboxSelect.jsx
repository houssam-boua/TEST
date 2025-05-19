import React, { useState, useRef, useEffect } from 'react';

const CheckboxSelect = ({
  options = [],
  selectedValues = [],
  onChange,
  label = 'Select',
  required = false,
  placeholder = 'Select options',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayValues, setDisplayValues] = useState('');
  const selectRef = useRef(null);

  // Update display value based on selections
  useEffect(() => {
    if (selectedValues.length === 0) {
      setDisplayValues(placeholder);
    } else {

      setDisplayValues(selectedValues);
  }}, [selectedValues, placeholder]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    const newSelected = selectedValues.includes(option)
      ? selectedValues.filter((item) => item !== option)
      : [...selectedValues, option];
    onChange(newSelected);
  };

  return (
    <fieldset className='fieldset w-full '>
      <legend className='fieldset-legend'>
        <span className='label-text '>{label}</span>
        {required && <span className='fieldset-label text-error'>(*)</span>}
      </legend>

      <div className='' ref={selectRef}>
        {/* Fake select that triggers the dropdown */}
        <div
          className='select select-bordered w-full cursor-pointer flex items-center'
          onClick={() => setIsOpen(!isOpen)}
        >
          <span
            className={`${selectedValues.length === 0 ? 'text-gray-400' : ''}`}
          >
            {displayValues}
          </span>
        </div>

        {/* Dropdown with checkboxes */}
        {isOpen && (
          <div className=' min-w-fit bg-white border border-gray-300 rounded-lg shadow-lg p-2 absolute '>
            {options.map((option) => (
              <label
                key={option}
                className='flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer'
              >
                <input
                  type='checkbox'
                  checked={selectedValues.includes(option)}
                  onChange={() => toggleOption(option)}
                  className='checkbox checkbox-xs'
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </fieldset>
  );
};

export default CheckboxSelect;
