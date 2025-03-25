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
       Consultation des documents (list)
     </Link>
   </li>,
   <li
     key='4'
     className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
     onClick={() => handleSidebarClick("Gestion d'accès")}
   >
     <Link
       className='text-inherit flex items-center p-2'
       to={'access-management'}
     >
       <svg
         xmlns='http://www.w3.org/2000/svg'
         viewBox='0 0 24 24'
         fill='currentColor'
         className='h-5 w-5 mr-2'
       >
         <path
           fillRule='evenodd'
           d='M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z'
           clipRule='evenodd'
         />
       </svg>
       Gestion d'accès
     </Link>
   </li>,
   <li
     key='5'
     className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
     onClick={() => handleSidebarClick('Gestion des utilisateurs')}
   >
     <Link
       className='text-inherit flex items-center p-2'
       to={'user-management'}
     >
       <svg
         xmlns='http://www.w3.org/2000/svg'
         viewBox='0 0 24 24'
         fill='currentColor'
         className='h-5 w-5 mr-2'
       >
         <path
           d='M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873.75.75 0 0 1-.5-1.416 11.543 11.543 0 0 0 5.96-1.698 1.5 1.5 0 0 0 .732-.732 11.55 11.55 0 0 0 1.698-5.96.75.75 0 0 1 1.416.5 13.066 13.066 0 0 1-1.873 6.761l-.003.001ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z'
           clipRule='evenodd'
         />
       </svg>
       Gestion des utilisateurs
     </Link>
   </li>,
   <li
     key='6'
     className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
     onClick={() => handleSidebarClick("Visualisation d'historiques")}
   >
     <Link className='text-inherit flex items-center p-2' to={'history'}>
       <svg
         xmlns='http://www.w3.org/2000/svg'
         viewBox='0 0 24 24'
         fill='currentColor'
         className='h-5 w-5 mr-2'
       >
         <path
           fillRule='evenodd'
           d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z'
           clipRule='evenodd'
         />
       </svg>
       Visualisation d'historiques
     </Link>
   </li>,
   <li
     key='7'
     className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
     onClick={() => handleSidebarClick('Configuration de workflow')}
   >
     <Link
       className='text-inherit flex items-center p-2'
       to={'workflow-config'}
     >
       <svg
         xmlns='http://www.w3.org/2000/svg'
         viewBox='0 0 24 24'
         fill='currentColor'
         className='h-5 w-5 mr-2'
       >
         <path
           fillRule='evenodd'
           d='M4.5 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5h-.75V3.75a.75.75 0 0 0 0-1.5h-15ZM9 6a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Zm-.75 3.75A.75.75 0 0 1 9 9h1.5a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM9 12a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Zm3.75-5.25A.75.75 0 0 1 13.5 6H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM13.5 9a.75.75 0 0 0 0 1.5H15A.75.75 0 0 0 15 9h-1.5Zm-.75 3.75a.75.75 0 0 1 .75-.75H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM9 19.5v-2.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75Z'
           clipRule='evenodd'
         />
       </svg>
       Configuration de workflow
     </Link>
   </li>,
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
