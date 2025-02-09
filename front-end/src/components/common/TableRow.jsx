import { Link } from "react-router-dom";

const TableRow = ({
  item, // The individual row data
  selectedItems, // Set of selected items
  handleCheckboxChange, // Function to handle checkbox change
  columns = [], // Array of column configurations
  editLinkBase, // Base URL for the edit link (optional)
  detailsLinkBase, // Base URL for the details link (optional)
  customActions = [], // Array or function for custom actions (can be buttons or links)
}) => (
  <tr className="text-base-content hover:bg-secondary/100">
    {/* Checkbox Column */}
    <td className="text-center w-auto">
      <input
        type="checkbox"
        className="checkbox checkbox-primary border border-base-300/20 shadow-xs rounded-sm size-4"
        checked={selectedItems.has(item.id)} // Ensure checkbox reflects current state
        onChange={() => handleCheckboxChange(item.id)}
      />
    </td>

    {/* Dynamic Columns */}
    {columns.map((col, index) => (
      <td key={index} className={col.className || ""}>
        {col.render ? col.render(item[col.field], item) : item[col.field]}
      </td>
    ))}

    {/* Details Link Column */}
    {detailsLinkBase && (
      <td>
        <button className="link link-accent btn-xs">
          <Link to={`${detailsLinkBase}/${item.id}`}>Details</Link>
        </button>
      </td>
    )}
  </tr>
);

export default TableRow;
