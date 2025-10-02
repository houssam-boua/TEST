import React, { useState, useRef, useEffect } from 'react';
import { Checkbox } from '../components/ui/checkbox';

const CheckboxSelect = ({
  options = [],
  selectedValues = [],
  onChange,
  label = 'Select',
  required = false,
  placeholder = 'Select options',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const selectRef = useRef(null);

  // Update display value based on selections
  useEffect(() => {
    if (selectedValues.length === 0) {
      setDisplayValue(placeholder);
    } else if (selectedValues.length === 1) {
      setDisplayValue(selectedValues[0]);
    } else {
      setDisplayValue(`${selectedValues.length} selected`);
    }
  }, [selectedValues, placeholder]);

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
    <div className='w-full'>
      <label className='block text-sm font-medium text-gray-700 mb-2'>
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>

      <div className='relative' ref={selectRef}>
        {/* Fake select that triggers the dropdown */}
        <div
          className='w-full cursor-pointer flex items-center h-10 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
          onClick={() => setIsOpen(!isOpen)}
        >
          <span
            className={`${selectedValues.length === 0 ? 'text-muted-foreground' : ''}`}
          >
            {displayValue}
          </span>
          <svg
            className={`ml-auto h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </div>

        {/* Dropdown with checkboxes */}
        {isOpen && (
          <div className='absolute z-10 mt-1 w-full bg-background border border-border rounded-lg shadow-lg p-2 max-h-60 overflow-auto'>
            {options.map((option) => (
              <label
                key={option}
                className='flex items-center gap-3 p-2 hover:bg-accent hover:text-accent-foreground rounded cursor-pointer'
              >
                <Checkbox
                  checked={selectedValues.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                <span className='text-sm'>{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckboxSelect;
