// components/file-previews/PDFPreview.jsx
import React from 'react';

const PDFPreview = ({ url, fileName }) => {
  return <iframe src={url} className='w-full h-full' title={fileName} />;
};

export default PDFPreview;
