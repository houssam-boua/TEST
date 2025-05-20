import React, { useState } from 'react';

const NestedTable = ({
  data,
  columns,
  icons = {},
  rowClassName = '',
  headerClassName = '',
  tableClassName = '',
  containerClassName = '',
  onRowSelect,
  onRowExpand,
  indentSize = 20,
  showCheckboxes = true,
}) => {
  // Default icons if none provided
  const defaultIcons = {
    folder: (
      <svg className='w-4 h-4 fill-current text-primary' viewBox='0 0 20 20'>
        <path d='M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z' />
      </svg>
    ),
    file: (
      <svg className='w-4 h-4 fill-current text-gray-400' viewBox='0 0 20 20'>
        <path
          fillRule='evenodd'
          d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z'
          clipRule='evenodd'
        />
      </svg>
    ),
    expand: (
      <svg className='w-4 h-4 fill-current' viewBox='0 0 20 20'>
        <path
          fillRule='evenodd'
          d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
          clipRule='evenodd'
        />
      </svg>
    ),
    collapse: (
      <svg className='w-4 h-4 fill-current' viewBox='0 0 20 20'>
        <path
          fillRule='evenodd'
          d='M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z'
          clipRule='evenodd'
        />
      </svg>
    ),
  };

  // Merge default icons with custom ones
  const mergedIcons = { ...defaultIcons, ...icons };

  const [expandedRows, setExpandedRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const toggleExpand = (rowId) => {
    const newExpandedRows = expandedRows.includes(rowId)
      ? expandedRows.filter((id) => id !== rowId)
      : [...expandedRows, rowId];

    setExpandedRows(newExpandedRows);
    if (onRowExpand) onRowExpand(rowId, !expandedRows.includes(rowId));
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

      if (onRowSelect) onRowSelect(newSelection);
      return newSelection;
    });
  };

  const someChildrenSelected = (children) => {
    return (
      children?.some((child) => selectedRows.includes(child.id)) &&
      !children?.every((child) => selectedRows.includes(child.id))
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

    const rowClasses = [
      rowClassName,
      isSelected ? 'bg-neutral/10' : '',
      row.rowClassName || '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <React.Fragment key={row.id}>
        <tr className={rowClasses}>
          <td
            style={{ paddingLeft: `${depth * indentSize}px` }}
            className='flex items-center'
          >
            {showCheckboxes && (
              <input
                type='checkbox'
                checked={isSelected}
                ref={(el) => el && (el.indeterminate = isIndeterminate)}
                onChange={() => handleRowSelect(row.id, isParent, childrenIds)}
                className='checkbox checkbox-sm checkbox-neutral w-3 h-3 transition duration-150 ease-in-out mx-3'
              />
            )}

            {hasChildren ? (
              <button
                onClick={() => toggleExpand(row.id)}
                className='flex items-center focus:outline-none'
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? mergedIcons.collapse : mergedIcons.expand}
                {mergedIcons.folder}
              </button>
            ) : (
              mergedIcons.file
            )}

            <span className='ml-2'>{row.name}</span>
          </td>

          {columns.map((column) => (
            <td key={`${row.id}-${column.key}`} className='py-2 px-4'>
              {column.render ? column.render(row) : row[column.key]}
            </td>
          ))}
        </tr>

        {hasChildren &&
          isExpanded &&
          row.children.map((child) => renderRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div
      className={`w-full overflow-x-auto border border-base-content/5 bg-base-100 ${containerClassName}`}
    >
      <table className={`table ${tableClassName}`}>
        <thead className={`bg-secondary/30 ${headerClassName}`}>
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
