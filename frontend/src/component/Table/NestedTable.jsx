import React, { useState } from 'react';
import {
 
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import { HiFolder, HiOutlineDocument, HiOutlineFolder } from 'react-icons/hi2';

const NestedTable = ({ data, columns }) => {
  const [expandedRows, setExpandedRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const toggleExpand = (rowId) => {
    setExpandedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId],
    );
  };

  const handleRowSelect = (rowId, isParent, childrenIds) => {
    setSelectedRows((prev) => {
      let newSelection = [...prev];

      if (newSelection.includes(rowId)) {
        newSelection = newSelection.filter((id) => id !== rowId);

        if (isParent) {
          newSelection = newSelection.filter((id) => !childrenIds.includes(id));
        }
      } else {
        newSelection.push(rowId);
        if (isParent) {
          childrenIds.forEach((childId) => {
            if (!newSelection.includes(childId)) {
              newSelection.push(childId);
            }
          });
        }
      }

      return newSelection;
    });
  };

  const someChildrenSelected = (children) => {
    return (
      children.some((child) => selectedRows.includes(child.id)) &&
      !children.every((child) => selectedRows.includes(child.id))
    );
  };

  const renderRow = (row, depth = 0, isParent = false) => {
    const isExpanded = expandedRows.includes(row.id);
    const hasChildren = row.children && row.children.length > 0;
    const childrenIds = hasChildren
      ? row.children.map((child) => child.id)
      : [];
    const isSelected = selectedRows.includes(row.id);
    const isIndeterminate = hasChildren && someChildrenSelected(row.children);

    return (
      <React.Fragment key={row.id}>
        <tr className={`${isSelected ? 'bg-neutral/10' : ''}`}>
          <td
            style={{ paddingLeft: `${depth * 20}px` }}
            className='flex items-center'
          >
            <input
              type='checkbox'
              checked={isSelected}
              ref={(el) => el && (el.indeterminate = isIndeterminate)}
              onChange={() => handleRowSelect(row.id, isParent, childrenIds)}
              className='checkbox checkbox-sm checkbox-neutral w-3 h-3 transition duration-150 ease-in-out mx-3'
            />
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(row.id)}
                className='flex items-center focus:outline-none'
              >
                {isExpanded ? (
                  <FiChevronDown className='mr-1' />
                ) : (
                  <FiChevronRight className='mr-1' />
                )}
                <HiFolder className='mr-2 fill-primary' />
              </button>
            ) : (
              <HiOutlineDocument className='text-primary ml-3 mr-2' />
            )}
            {row.name}
          </td>

          {columns.map((column) => (
            <td key={column.key} className='py-2 px-4'>
              {row[column.key]}
            </td>
          ))}
        </tr>

        {/* Child Rows */}
        {hasChildren &&
          isExpanded &&
          row.children.map((child) => renderRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className='w-full overflow-x-auto border border-base-content/5 bg-base-100'>
      <table className='table'>
        <thead className='bg-secondary/30'>
          <tr>
            <th className='px-6 py-2 text-left text-xs font-medium tracking-wider'>
              Name
            </th>
            {columns.map((column) => (
              <th
                key={column.key}
                className='px-3 py-2 text-left text-xs font-medium text-primary uppercase tracking-wider'
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{data.map((row) => renderRow(row, 0, true))}</tbody>
      </table>
    </div>
  );
};

export default NestedTable;
