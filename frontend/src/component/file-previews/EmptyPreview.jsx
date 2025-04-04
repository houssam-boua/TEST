import React from "react";

const EmptyPreview = ({ message = 'No file selected' }) => {
  return <p className='text-base-500'>{message}</p>;
};

export default EmptyPreview;
