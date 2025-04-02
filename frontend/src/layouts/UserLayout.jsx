import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import Header from '../component/Header';
import Breadcrumbs from '../component/Breadcrumbs';
import DefaultLayout from './DefaultLayout';
import Acceuil from '../pages/Acceuil';

const UserLayout = () => {
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
          viewBox='0 0 24 24'
          fill='currentColor'
          className='h-5 w-5 mr-2'
        >
          <path d='M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z' />
          <path d='m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z' />
        </svg>
        Accueil
      </Link>
    </li>,
    <li
      key='2'
      className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
      onClick={() => handleSidebarClick('Création des documents')}
    >
      <Link className='text-inherit flex items-center p-2' to='upload-doc'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          className='h-5 w-5 mr-2'
        >
          <path d='M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z' />
          <path d='M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z' />
        </svg>
        Création des documents
      </Link>
    </li>,
    <li
      key='3'
      className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
      onClick={() => handleSidebarClick('Consultation des documents')}
    >
      <Link className='text-inherit flex items-center p-2' to={'list-docs'}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          className='h-5 w-5 mr-2'
        >
          <path d='M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z' />
        </svg>
        Consultation des documents
      </Link>
    </li>,
  ];

  return (
    <>
      <DefaultLayout
        sidebarContent={sidebarContent}
        breadcrumbs={breadcrumbs}
        username={'Utilisateur'}
      ></DefaultLayout>
    </>
  );
};

export default UserLayout;

