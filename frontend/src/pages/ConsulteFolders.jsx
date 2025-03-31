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
        <div className='w-full h-full lg:w-1/5 lg:h-full'>
          <Arborescence data={treeData} pathname={location.pathname} />
        </div>

        <div className='flex flex-col w-full lg:w-4/5 min-h-[650px] rounded-md'>
          <div className='w-full h-fit'>
            <Arborescence data={treeData} pathname={location.pathname} />
          </div>
          {/* name of each tab group should be unique */}
          <div className='flex-1'>
            <div className=' mt-3 tabs gap-1.5  '>
              <input
                type='radio'
                name='my_tabs_6'
                className='tab checked:bg-primary checked:text-primary-content rounded-xs mb-2 p-1.5 '
                aria-label='Proprietes'
              />
              <div className='tab-content bg-base-100 p-3 border border-base-300/50 rounded-md '>
                Tab content 1
              </div>

              <input
                type='radio'
                name='my_tabs_6'
                className='tab checked:bg-primary checked:text-primary-content rounded-xs mb-2 p-1.5 '
                aria-label='Commentaires'
                defaultChecked
              />
              <div className='tab-content bg-base-100 p-3 border border-base-300/50 rounded-md '>
                Tab content 2
              </div>

              <input
                type='radio'
                name='my_tabs_6'
                className='tab checked:bg-primary checked:text-primary-content rounded-xs mb-2 p-1.5 '
                aria-label='Historiques'
              />
              <div className='tab-content bg-base-100 p-3 border border-base-300/50 rounded-md '>
                Tab content 3
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsulteFolders;
