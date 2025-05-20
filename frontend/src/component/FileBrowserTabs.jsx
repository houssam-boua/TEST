// components/FileBrowserTabs.jsx
import React from 'react';

const FileBrowserTabs = ({ selectedFile, children }) => {
  return (
    <div className='text-sm mt-3 tabs gap-1.5 '>
      <input
        type='radio'
        name='file_browser_tabs'
        className='tab checked:bg-primary checked:text-primary-content rounded-md  mb-2 p-1.5 '
        aria-label='Proprietes'
        defaultChecked
      />
      <div className='tab-content bg-base-100 p-3 border border-base-300/50 rounded-md'>
        {children[0]}
      </div>

      <input
        type='radio'
        name='file_browser_tabs'
        className='tab checked:bg-primary checked:text-primary-content rounded-md  mb-2 p-1.5 '
        aria-label='Commentaires'
      />
      <div className='tab-content bg-base-100 p-3 border border-base-300/50 rounded-md'>
        {children[1]}
      </div>

      <input
        type='radio'
        name='file_browser_tabs'
        className='tab checked:bg-primary checked:text-primary-content rounded-md  mb-2 p-1.5 '
        aria-label='Historiques'
      />
      <div className='tab-content bg-base-100 p-3 border border-base-300/50 rounded-md'>
        {children[2]}
      </div>
    </div>
  );
};

export default FileBrowserTabs;
