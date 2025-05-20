import React from 'react';

const TableCell = ({ cell, index }) => {
  if (index === 2) {
    // Status column
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
