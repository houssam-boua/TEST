import React from "react";

// components/file-previews/DefaultPreview.jsx

const DefaultPreview = ({ fileName }) => {
  return (
    <p className='text-base-500 h-[500px] '>
      No preview available for {fileName}
    </p>
  );
};

export default DefaultPreview;
