import React from 'react';

const TableCell = ({ cell, index, statusColumnIndex }) => {
  // Apply badge styling only if this is the status column
  if (index === statusColumnIndex) {
    return (
      <span
        className={`badge-sm rounded-lg ${
          cell === 'success'
            ? 'badge badge-success badge-dash'
            : cell === 'error'
              ? 'badge badge-error badge-dash'
              : 'badge badge-neutral badge-dash'
        }`}
      >
        {cell}
      </span>
    );
  }
  return <>{cell}</>;
};

export default TableCell;
