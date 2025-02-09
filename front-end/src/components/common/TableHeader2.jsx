const TableHeader2 = ({
  columnLabels = [], // Array of labels for each column header
}) => (
  <>
    <tr>
      {columnLabels.map((label, index) => (
        <th key={index}>{label}</th>
      ))}
    </tr>
  </>
);

export default TableHeader2;
