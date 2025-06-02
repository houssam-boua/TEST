import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import DefaultLayout from './DefaultLayout';

function AdminLayout() {
  const [breadcrumbs, setBreadcrumbs] = useState(['/']);

  const handleSidebarClick = (crumb) => {
    setBreadcrumbs(['/', crumb]);
  };

  const sidebarContent = [
    <li
      key='1'
      className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
      onClick={() => handleSidebarClick('Accueil')}
    >
      <Link className='text-inherit flex items-center p-2' to={'acceuil'}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='size-5'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25'
          />
        </svg>
        Accueil
      </Link>
    </li>,
    <li
      key='2'
      className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
      onClick={() => handleSidebarClick('Accueil')}
    >
      <Link className='text-inherit flex items-center p-2' to={'upload-doc'}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='size-5 mr-2'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z'
          />
        </svg>
        Créer
      </Link>
    </li>,

    <li
      key='3'
      className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
      onClick={() => handleSidebarClick('Consultation des documents')}
    >
      <Link className='text-inherit flex items-center p-2' to={'consulte-docs'}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='size-5'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z'
          />
        </svg>
        Consulter
      </Link>
    </li>,
    
    <li
      key='4'
      className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
      onClick={() => handleSidebarClick('Gestion des utilisateurs')}
    >
      <Link
        className='text-inherit flex items-center p-2'
        to={'user-management'}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='size-5'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z'
          />
        </svg>
        Utilisateurs
      </Link>
    </li>,
    <li
      key='5'
      className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
      onClick={() => handleSidebarClick("Visualisation d'historiques")}
    >
      <Link className='text-inherit flex items-center p-2' to={'history'}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='size-5'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
          />
        </svg>
        Historiques
      </Link>
    </li>,
    <li
      key='6'
      className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
      onClick={() => handleSidebarClick('Configuration de workflow')}
    >
      <Link className='text-inherit flex items-center p-2' to={'workflow-list'}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='size-5'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3'
          />
        </svg>
        flux de travail
      </Link>
    </li>,

    // <li
    //   key='7'
    //   className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
    //   onClick={() => handleSidebarClick('Configuration de workflow')}
    // >
    //   <details open className=''>
    //     <summary>Parent</summary>
    //     <ul>
    //       <li>
    //         <a>Submenu 1</a>
    //       </li>
    //       <li>
    //         <a>Submenu 2</a>
    //       </li>
    //     </ul>
    //   </details>
    // </li>,
  ];

  return (
    <DefaultLayout
      sidebarContent={sidebarContent}
      breadcrumbs={breadcrumbs}
      username={'Admin'}
    ></DefaultLayout>
  );
}

export default AdminLayout;
