import React from "react";
import TableHeader from "./TableHeader";

const TableHeaderSection = ({
  selectedItems,
  itemsLength,
  handleSelectAllChange,
  searchTerms,
  handleSearchChange,
  columnLabels,
  searchFields,
}) => (
  <TableHeader
    selectedItems={selectedItems}
    itemsLength={itemsLength}
    handleSelectAllChange={handleSelectAllChange}
    searchTerms={searchTerms}
    handleSearchChange={handleSearchChange}
    columnLabels={columnLabels}
    searchFields={searchFields}
  />
);

export default TableHeaderSection;
