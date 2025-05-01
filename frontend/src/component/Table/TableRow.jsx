import React from 'react';
import TableCheckbox from './TableCheckbox';
import TableCell from './TableCell';

const TableRow = ({
  row,
  rowIndex,
  isSelected,
  onCheckboxChange,
  statusColumnIndex,
}) => {
  return (
    <tr className='hover:bg-neutral-50 transition duration-200'>
      <td className='px-6 py-2 whitespace-nowrap'>
        <TableCheckbox
          checked={isSelected}
          onChange={() => onCheckboxChange(rowIndex)}
        />
      </td>
      {row.map((cell, cellIndex) => (
        <td
          key={cellIndex}
          className='px-3 py-2 whitespace-nowrap text-sm text-gray-900'
        >
          <TableCell
            cell={cell}
            index={cellIndex}
            statusColumnIndex={statusColumnIndex}
          />
        </td>
      ))}
    </tr>
  );
};

export default TableRow;
