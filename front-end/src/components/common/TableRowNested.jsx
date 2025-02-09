import React, { useState } from "react";
import { Link } from "react-router-dom";

const TableRowNested = ({
  item,
  selectedItems,
  handleCheckboxChange,
  columns = [],
  editLinkBase = "",
  nestedRows = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // State for expanding nested rows

  const toggleExpand = () => setIsExpanded(!isExpanded); // Toggle expansion

  return (
    <>
      <tr className="text-base-content hover:bg-secondary/100">
        <td className="text-center w-auto">
          <input
            type="checkbox"
            className="checkbox border border-base-300/20 shadow-xs rounded-sm size-4"
            checked={selectedItems.has(item.id)}
            onChange={() => handleCheckboxChange(item.id)}
          />
        </td>

        <td className="text-center w-auto">
          <Link
            to={`${editLinkBase}/${item.id}`}
            className="link link-accent link-hover"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4"
            >
              <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
            </svg>
          </Link>
        </td>

        <td>{item.id}</td>

        {/* Expand/Collapse Button with Rotating Arrow */}
        <td>
          <button onClick={toggleExpand} style={{ cursor: "pointer" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
              style={{
                transition: "transform 0.3s ease", // Smooth rotation
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", // Rotation effect
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>{" "}
          {item.sub_chapter_title}
        </td>

        {/* Render Dynamic Columns */}
        {columns.map((col, index) => (
          <td key={index}>{item[col]}</td>
        ))}
      </tr>

      {/* Nested Exigences Rows (Visible only if expanded) */}
      {isExpanded &&
        nestedRows.map((nestedRow) => (
          <tr
            key={nestedRow.id}
            className="text-sm  text-gray-600 hover:bg-secondary/10"
          >
            <td></td>
            <td></td>
            <td>{nestedRow.id}</td>

            {/* Exigence content in the designated column */}
            <td colSpan={columns.length - 1} className="pl-10">
              {nestedRow.content}
            </td>

            {/* Add description if it exists in the columns */}
            {columns.includes("description") && (
              <td>{nestedRow.description}</td>
            )}
          </tr>
        ))}
    </>
  );
};

export default TableRowNested;
