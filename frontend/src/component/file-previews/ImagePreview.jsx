import React from "react";

const ImagePreview = ({ url, fileName }) => {
  return <img src={url} alt={fileName} className='w-fit h-9/12' />;
};

export default ImagePreview;
