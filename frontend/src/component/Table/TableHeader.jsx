import React from 'react';
import TableCheckbox from './TableCheckbox';

const TableHeader = ({ headers, selectedCount, totalRows, onSelectAll }) => {
  return (
    <thead className={`bg-secondary/30`}>
      <tr>
        <th className='px-6 py-2 text-left text-xs font-medium tracking-wider'>
          <TableCheckbox
            checked={selectedCount === totalRows && totalRows > 0}
            onChange={onSelectAll}
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
  );
};

export default TableHeader;
