// pages/ConsulteFolders.jsx
import { useLocation } from 'react-router-dom';
import React from 'react';
import { useState } from 'react';
import Arborescence from '../component/Arboresence';
import FileBrowserTabs from '../component/FileBrowserTabs';
import FileProperties from '../component/FileProperties';
import FilePreview from '../component/FilePreview';
import FileViewer from '../component/FileViewer';

const DEFAULT_TREE_DATA = [
  {
    name: 'Root',
    children: [
      {
        name: 'Applicabilite',
        path: '/docs',
        children: [
          {
            name: 'Microsoft Word - 1147-S AMH LIIA MITC 367.docx',
            path: '/docs/CHD_SOM_Technical_Note_Flood_Risk.pdf',
            size: '1024',
            type: 'application/pdf',
            createdAt: Date.now(),
          },
          {
            name: 'Sub-item 2',
            path: '/docs/Microsoft Word - 1147-S AMH LIIA MITC 367.docx',
            size: '2048',
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            createdAt: Date.now(),
          },
        ],
      },
      { name: 'Conformite', path: '/conformite' },
      { name: 'Actions', path: '/actions' },
    ],
  },
];

const ConsulteFolders = ({ treeData = DEFAULT_TREE_DATA }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='flex flex-col lg:flex-row gap-1.5'>
        <div className=' min-h-[450px] '>
          <Arborescence
            data={treeData}
            pathname={location.pathname}
            onFileClick={handleFileClick}
          />
        </div>

        <div className='flex flex-col w-full min-h-[650px] rounded-md'>
          <div className='w-auto border border-base-300/50 p-2 flex items-center justify-center h-auto resize-y cursor-s-resize min-h-[450px] rounded-md'>
            <FileViewer file={selectedFile} onError={handleError} />
          </div>

          <div className='flex-1 h-full'>
            <FileBrowserTabs selectedFile={selectedFile}>
              <FileProperties file={selectedFile} />
              <div>Comments section</div>
              <div>History section</div>
            </FileBrowserTabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsulteFolders;
