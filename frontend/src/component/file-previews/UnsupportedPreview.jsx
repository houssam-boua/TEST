import React from "react";

const UnsupportedPreview = ({ message = 'Unsupported file type' }) => {
  return <p className='text-base-500'>{message}</p>;
};

export default UnsupportedPreview;
