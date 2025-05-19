// components/file-previews/TextPreview.jsx
import React from 'react';

const TextPreview = ({ content, fileName }) => {
  return (
    <div className=' p-4'>
      <h3 className='text-lg font-bold mb-2'>sd{fileName}</h3>
      <pre className='whitespace-pre-wrap h-[500px]'>{content}</pre>
    </div>
  );
};

export default TextPreview;
