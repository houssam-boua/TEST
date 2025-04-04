// components/Table/ExpandableRow.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const ExpandableRow = ({
  rowData,
  columns,
  depth = 0,
  isSelectable,
  isSelected,
  onSelect,
  renderCell,
  renderExpandedContent,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = rowData.children && rowData.children.length > 0;

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <>
      <tr className={`${className} ${depth > 0 ? 'bg-base-200' : ''}`}>
        {/* Expand/Collapse Column */}
        <td className='px-4'>
          {hasChildren && (
            <button
              onClick={toggleExpand}
              className='btn btn-ghost btn-xs'
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className='w-4 h-4' />
              ) : (
                <ChevronRight className='w-4 h-4' />
              )}
            </button>
          )}
        </td>

        {/* Selection Checkbox */}
        {isSelectable && (
          <td className='px-2'>
            <input
              type='checkbox'
              checked={isSelected}
              onChange={() => onSelect(rowData.id)}
              className='checkbox checkbox-xs'
            />
          </td>
        )}

        {/* Data Columns */}
        {columns.map((column) => (
          <td key={column.key} className='px-4 py-2'>
            {renderCell ? renderCell(rowData, column) : rowData[column.key]}
          </td>
        ))}
      </tr>

      {/* Expanded Content */}
      {isExpanded && hasChildren && (
        <>
          {renderExpandedContent && renderExpandedContent(rowData)}

          {rowData.children.map((child) => (
            <ExpandableRow
              key={child.id}
              rowData={child}
              columns={columns}
              depth={depth + 1}
              isSelectable={isSelectable}
              isSelected={isSelected}
              onSelect={onSelect}
              renderCell={renderCell}
              renderExpandedContent={renderExpandedContent}
              className={className}
            />
          ))}
        </>
      )}
    </>
  );
};

export default ExpandableRow;
