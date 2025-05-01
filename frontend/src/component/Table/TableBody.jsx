import React from 'react';
import TableRow from './TableRow';

const TableBody = ({
  rows,
  selectedRows,
  onCheckboxChange,
  statusColumnIndex,
}) => {
  return (
    <tbody className='divide-y divide-base-200'>
      {rows.map((row, rowIndex) => (
        <TableRow
          key={rowIndex}
          row={row}
          rowIndex={rowIndex}
          isSelected={selectedRows.includes(rowIndex)}
          onCheckboxChange={onCheckboxChange}
          statusColumnIndex={statusColumnIndex}
        />
      ))}
    </tbody>
  );
};

export default TableBody;
