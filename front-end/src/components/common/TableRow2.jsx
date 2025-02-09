import { Link } from "react-router-dom";

const TableRow2 = ({ rowData, columns }) => {
  return (
    <tr>
      {columns.map((column, index) => (
        <td key={index}>
          {typeof column.value === "function"
            ? column.value(rowData[column.field])
            : rowData[column.field]}
        </td>
      ))}
    </tr>
  );
};

export default TableRow2;
