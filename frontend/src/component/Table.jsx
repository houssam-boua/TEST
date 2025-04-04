import React,{ useState } from 'react';
import TableBody from './Table/TableBody';
import TableHeader from './Table/TableHeader';

const Table = ({ headers, rows, onSelect }) => {
  const [selectedRows, setSelectedRows] = useState([]);

  const handleCheckboxChange = (rowIndex) => {
    const newSelectedRows = selectedRows.includes(rowIndex)
      ? selectedRows.filter((index) => index !== rowIndex)
      : [...selectedRows, rowIndex];

    setSelectedRows(newSelectedRows);
    onSelect?.(newSelectedRows);
  };

  const handleSelectAll = () => {
    const newSelectedRows =
      selectedRows.length === rows.length ? [] : rows.map((_, index) => index);

    setSelectedRows(newSelectedRows);
    onSelect?.(newSelectedRows);
  };

  return (
    <div className='w-full overflow-x-auto border border-base-content/5 bg-base-100'>
      <table className='table'>
        <TableHeader
          headers={headers}
          selectedCount={selectedRows.length}
          totalRows={rows.length}
          onSelectAll={handleSelectAll}
        />
        <TableBody
          rows={rows}
          selectedRows={selectedRows}
          onCheckboxChange={handleCheckboxChange}
        />
      </table>
    </div>
  );
};

export default Table;
