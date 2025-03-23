import React, { useState } from 'react';

const Table = ({ headers, rows, onSelect }) => {
  const [selectedRows, setSelectedRows] = useState([]);

  // Handle checkbox selection
  const handleCheckboxChange = (rowIndex) => {
    const isSelected = selectedRows.includes(rowIndex);
    if (isSelected) {
      // Deselect the row
      setSelectedRows(selectedRows.filter((index) => index !== rowIndex));
    } else {
      // Select the row
      setSelectedRows([...selectedRows, rowIndex]);
    }
    // Notify parent component of selected rows (optional)
    if (onSelect) {
      onSelect(selectedRows);
    }
  };

  // Handle "Select All" checkbox
  const handleSelectAll = () => {
    if (selectedRows.length === rows.length) {
      // Deselect all rows
      setSelectedRows([]);
    } else {
      // Select all rows
      setSelectedRows(rows.map((_, index) => index));
    }
  };

  return (
    <div className=' w-full overflow-x-auto  border border-base-content/5 bg-base-100'>
      <table className='table '>
        {/* Table Header */}
        <thead className='bg-secondary/30'>
          <tr>
            <th className='px-6 py-2 text-left text-xs font-medium  tracking-wider'>
              <input
                type='checkbox'
                checked={selectedRows.length === rows.length && rows.length > 0}
                onChange={handleSelectAll}
                className='checkbox checkbox-sm checkbox-neutral w-4 h-4 transition duration-150 ease-in-out'
              />
            </th>
            {headers.map((header, index) => (
              <th
                key={index}
                className='px-3 py-2 text-left text-xs font-medium text-primary uppercase tracking-wider'
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className='divide-y divide-base-200'>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className='hover:bg-neutral-50 transition duration-200'
            >
              {/* Checkbox Column */}
              <td className='px-6 py-2 whitespace-nowrap'>
                <input
                  type='checkbox'
                  checked={selectedRows.includes(rowIndex)}
                  onChange={() => handleCheckboxChange(rowIndex)}
                  className='checkbox  checkbox-neutral w-4 h-4 transition duration-150 ease-in-out'
                />
              </td>
              {/* Data Columns */}
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className='px-3 py-2 whitespace-nowrap text-sm text-gray-900'
                >
                  {cellIndex === 2 ? ( // Third column (Status)
                    <span
                      className={`badge-sm rounded-lg ${
                        cell === 'success'
                          ? 'badge badge-success badge-soft'
                          : cell === 'error'
                            ? 'badge badge-error badge-soft'
                            : 'badge badge-neutral badge-soft'
                      }`}
                    >
                      {cell}
                    </span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
