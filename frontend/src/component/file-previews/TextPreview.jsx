// components/file-previews/TextPreview.jsx
import React from 'react';

const TextPreview = ({ content, fileName }) => {
  return (
    <div className='p-4'>
      <h3 className='text-lg font-bold mb-2'>{fileName}</h3>
      <pre className='whitespace-pre-wrap'>{content}</pre>
    </div>
  );
};

export default TextPreview;
