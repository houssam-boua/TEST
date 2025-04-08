import React, { useState, useRef, useEffect } from 'react';

const SearchableCheckboxDropdown = ({
  options = [],
  selectedOptions = [],
  onChange,
  placeholder = 'Search and select...',
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleOption = (optionValue) => {
    const newSelected = selectedOptions.includes(optionValue)
      ? selectedOptions.filter((item) => item !== optionValue)
      : [...selectedOptions, optionValue];
    onChange(newSelected);
  };

  const toggleSelectAll = () => {
    const allFilteredValues = filteredOptions.map((opt) => opt.value);
    const allSelected = allFilteredValues.every((val) =>
      selectedOptions.includes(val),
    );

    onChange(
      allSelected
        ? selectedOptions.filter((val) => !allFilteredValues.includes(val))
        : Array.from(new Set([...selectedOptions, ...allFilteredValues])),
    );
  };

  return (
    <div className={` ${className}`} ref={dropdownRef}>
      {/* Search input */}
      <input
        type='text'
        placeholder={placeholder}
        className='input input-bordered w-full'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onClick={() => setIsOpen(true)}
      />

      {/* Dropdown menu */}
      {isOpen && (
        <div className='absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto'>
          {/* Select All option */}
          <label className='flex items-center gap-2 p-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer'>
            <input
              type='checkbox'
              checked={
                filteredOptions.length > 0 &&
                filteredOptions.every((opt) =>
                  selectedOptions.includes(opt.value),
                )
              }
              onChange={toggleSelectAll}
              className='checkbox checkbox-sm'
            />
            <span className='font-medium'>Select All</span>
          </label>

          {/* Filtered options */}
          {filteredOptions.map((option) => (
            <label
              key={option.value}
              className='flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer'
            >
              <input
                type='checkbox'
                checked={selectedOptions.includes(option.value)}
                onChange={() => toggleOption(option.value)}
                className='checkbox checkbox-sm'
              />
              <span>{option.label}</span>
            </label>
          ))}

          {filteredOptions.length === 0 && (
            <div className='p-2 text-gray-500'>No options found</div>
          )}
        </div>
      )}

      {/* Selected tags */}
      {selectedOptions.length > 0 && (
        <div className='mt-2 flex flex-wrap gap-1'>
          {selectedOptions.map((value) => {
            const option = options.find((opt) => opt.value === value);
            return option ? (
              <span
                key={value}
                className='badge badge-outline p-2 flex items-center gap-1'
              >
                {option.label}
                <button
                  onClick={() => toggleOption(value)}
                  className='text-xs opacity-70 hover:opacity-100'
                >
                  ×
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default SearchableCheckboxDropdown;
