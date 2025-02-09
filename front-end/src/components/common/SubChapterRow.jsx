import React from "react";
import TableRowNested from "./TableRowNested";

const SubChapterRow = ({
  subChapter,
  selectedItems,
  handleCheckboxChange,
  columns,
}) => {
  // Prepare nested rows from the `subChapter`'s `exigences`
  const nestedRows = subChapter.exigences.map((exigence) => ({
    id: exigence.id,
    content: exigence.exigence_content,  // Exigence content
    description: exigence.exigence_description,  // Exigence description
  }));

  return (
    <TableRowNested
      item={{
        id: subChapter.sub_chapter_id,
        sub_chapter_title: subChapter.sub_chapter_title,
        exigences: subChapter.exigences,  // Pass the `exigences` to be used in nested rows
      }}
      selectedItems={selectedItems}
      handleCheckboxChange={handleCheckboxChange}
      columns={columns}  // Columns that should be displayed in the main row
      editLinkBase="/edit/subchapter"
      nestedRows={nestedRows}  // Pass the prepared `nestedRows`
    />
  );
};

export default SubChapterRow;
