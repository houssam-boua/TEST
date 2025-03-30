import { useLocation } from 'react-router-dom';
import Arborescence from '../component/Arboresence';
import React from 'react';

const ConsulteFolders = () => {
  const treeData = [
    {
      name: 'Veille reglementaire',
      children: [
        {
          name: 'Applicabilite',
          path: '/applicabilite',
          children: [
            { name: 'Sub-item 1', path: '/applicabilite/sub1' },
            { name: 'Sub-item 2', path: '/applicabilite/sub2' },
          ],
        },
        { name: 'Conformite', path: '/conformite' },
        { name: 'Actions', path: '/actions' },
      ],
    },
  ];
  const location = useLocation();

  return (
    <div className='container mx-auto p-4'>
      <div className='flex flex-col lg:flex-row gap-1.5'>
        <div className='w-full h-full lg:full lg:w-2/5'>
          <Arborescence data={treeData} pathname={location.pathname} />
        </div>
        <div className='w-full lg:w-4/5 border border-base-300/50 p-2 flex-none min-h-[650px] rounded-md'>
          {/* Your content here */}
        </div>
      </div>
    </div>
  );
};

export default ConsulteFolders;
