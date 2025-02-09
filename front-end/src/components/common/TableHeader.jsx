const TableHeader = ({
  selectedItems = new Set(),
  itemsLength,
  handleSelectAllChange,
  searchTerms,
  handleSearchChange,
  columnLabels = [], // Array of labels for each column header
  searchFields = [], // Array of field names corresponding to each column
}) => (
  <>
    <tr>
      <th className="border border-base-300/20 border-l-0 text-center w-2">
        <input
          type="checkbox"
          className="checkbox border border-base-300/20 shadow-xs rounded-sm size-4"
          onChange={handleSelectAllChange}
          checked={selectedItems.size === itemsLength && itemsLength > 0}
        />
      </th>

      {columnLabels.map((label, index) => (
        <th key={index}>{label}</th>
      ))}
    </tr>

    {/* Search row */}
    <tr>
      <th></th>
      {searchFields.map((field, index) => (
        <th key={index}>
          <input
            type="text"
            name={field}
            placeholder={`Search ${field}...`}
            value={searchTerms[field] || ""}
            onChange={handleSearchChange}
            className="input-primary font-normal border-none border-b-2 border-b-primary input-xs w-full focus:outline-none focus:border-b-2 focus:border-b-blue-500"
          />
        </th>
      ))}
    </tr>
  </>
);

export default TableHeader;
