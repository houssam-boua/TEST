import { useState } from "react";

const useSelection = (data) => {
  const [selectedItems, setSelectedItems] = useState(new Set());

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      const allIds = new Set();
      data.forEach((subChapter) =>
        subChapter.exigences.forEach((exigence) => allIds.add(exigence.id))
      );
      setSelectedItems(allIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems((prevSelectedItems) => {
      const newSelectedItems = new Set(prevSelectedItems);
      if (newSelectedItems.has(id)) {
        newSelectedItems.delete(id);
      } else {
        newSelectedItems.add(id);
      }
      return newSelectedItems;
    });
  };

  return { selectedItems, handleSelectAllChange, handleCheckboxChange };
};

export default useSelection;
