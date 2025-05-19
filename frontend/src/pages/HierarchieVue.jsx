// pages/ConsulteFolders.jsx
import { Link, useLocation } from 'react-router-dom';
import React from 'react';
import { useState } from 'react';
import Arborescence from '../component/Arboresence';
import FileBrowserTabs from '../component/FileBrowserTabs';
import FileProperties from '../component/FileProperties';
import FileViewer from '../component/FileViewer';
import Filters from '../component/Filters';
import Toolbar from '../component/Toolbar';
import { HiArrowSmallLeft, HiCube } from 'react-icons/hi2';
 
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
      {
        name: 'Conformité',
        path: '/conformite',
        children: [{ name: 'Conformité', path: '/conformite', children: [] }],
      },
      { name: 'Actions', path: '/actions', children: [{}] },
      { name: 'Documents', path: '/documents', children: [] },
      { name: 'Rapports', path: '/rapports', children: [] },
      { name: 'Audits', path: '/audits' },
      { name: 'Sécurité', path: '/securite', children: [] },
      { name: 'Règlementations', path: '/reglementations', children: [] },
      { name: 'Contrôles', path: '/controles', children: [] },
      { name: 'Procédures', path: '/procedures', children: [] },
      { name: 'Politiques', path: '/politiques', children: [] },
      { name: 'Formations', path: '/formations', children: [] },
      { name: 'Incidents', path: '/incidents', children: [] },
      { name: 'Risques', path: '/risques', children: [] },
      { name: 'Validation', path: '/validation', children: [] },
      { name: 'Archives', path: '/archives', children: [] },
      { name: 'Réunions', path: '/reunions', children: [] },
      { name: 'Budgets', path: '/budgets', children: [] },
      { name: 'Fournisseurs', path: '/fournisseurs', children: [] },
      { name: 'Clients', path: '/clients', children: [] },
      { name: 'Projets', path: '/projets', children: [] },
    ],
  },
];

const ConsulteFolders = ({ treeData = DEFAULT_TREE_DATA }) => {
  const sidebarContent = [
    {
      key: 'ajouter',
      content: (
        <li className=''>
          <Link
            className='text-inherit flex items-center'
            to='/a/consulte-docs'
          >
            <HiArrowSmallLeft size={16} />
            Revenir au tableau
          </Link>
        </li>
      ),
    },
  ];
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
    <>
      {/* <Toolbar toolBarItems={sidebarContent.map((item) => item.content)} /> */}

      <div className='container mx-auto p-4'>
        <div className='flex flex-col lg:flex-row gap-1.5'>
          <div className='  '>
            <Arborescence
              data={treeData}
              pathname={location.pathname}
              onFileClick={handleFileClick}
            />
          </div>

          <div className='flex flex-col w-full  rounded-md gap-y-1.5'>
            <div className='w-auto border border-base-300/50 p-2 flex items-center justify-center h-auto resize-y cursor-s-resize min-h-[450px] rounded-md'>
              <FileViewer file={selectedFile} onError={handleError} />
            </div>

            <div className='flex-1'>
              <FileBrowserTabs selectedFile={selectedFile}>
                <FileProperties file={selectedFile} />
                <div>Comments section</div>
                <div>History section</div>
              </FileBrowserTabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConsulteFolders;
