import React from 'react';

const PDFPreview = ({ url, fileName }) => {
  return <iframe src={url} className='w-full h-[500px]' title={fileName} />;
};

export default PDFPreview;
