import React, { useState } from "react";
import TableHeader from "../../common/TableHeader";

const ApplicabiliteNorme = ({ items }) => {
  const [searchTerms, setSearchTerms] = useState({});

  const handleSearchChange = (e) => {
    setSearchTerms({
      ...searchTerms,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <table className="table table-xs  w-full rounded-sm border border-base-300/20 border-l-0">
      <thead className="text-pretty text-base-content">
        <TableHeader
          selectedItems={items}
          itemsLength={items.length}
          columnLabels={["Reglement/Norme", "Applicable", "Non Applicable"]}
          searchFields={["id", "norm_abbreviation_name"]}
          handleSearchChange={handleSearchChange}
          searchTerms={searchTerms}
        />
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.norm_abbreviation_name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ApplicabiliteNorme;
