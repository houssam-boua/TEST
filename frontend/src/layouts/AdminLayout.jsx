import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import DefaultLayout from './DefaultLayout';
import {
  HiDocumentArrowUp,
  HiDocumentText,
  HiHome,
  HiMagnifyingGlass,
  HiMagnifyingGlassCircle,
  HiMiniChartPie,
  HiMiniClock,
  HiMiniCog6Tooth,
  HiOutlineDocumentText,
  HiSparkles,
  HiSquare3Stack3D,
  HiUsers,
} from 'react-icons/hi2';

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
        <HiHome size={16} />
        Accueil
      </Link>
    </li>,

    <li key={'2'} className=''>
      <details open className=''>
        <summary className=' p-2'>
          <HiDocumentText size={16} /> Docuements
        </summary>

        <ul className=''>
          <li
            className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
            onClick={() => handleSidebarClick('Accueil')}
          >
            <Link
              className='text-inherit flex items-center p-2'
              to={'upload-doc'}
            >
              Creer
            </Link>
          </li>

          <li>
            <a>Submenu 2</a>
          </li>
        </ul>
      </details>
    </li>,
    <li
      key='3'
      className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
      onClick={() => handleSidebarClick('Consultation des documents')}
    >
      <Link className='text-inherit flex items-center p-2' to={'consulte-docs'}>
        <HiMagnifyingGlassCircle size={16} />
        Consulter
      </Link>
    </li>,
    <li
      key='4'
      className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
      onClick={() => handleSidebarClick("Gestion d'accès")}
    >
      <Link className='text-inherit flex items-center p-2' to={'workflow-list'}>
        <HiSparkles />
        Traitement d'image
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
        <HiUsers size={16} />
        Utilisateurs
      </Link>
    </li>,
    <li
      key='6'
      className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
      onClick={() => handleSidebarClick("Visualisation d'historiques")}
    >
      <Link className='text-inherit flex items-center p-2' to={'history'}>
        <HiMiniClock size={16} />
        Historiques
      </Link>
    </li>,
    <li
      key='7'
      className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
      onClick={() => handleSidebarClick('Configuration de workflow')}
    >
      <Link className='text-inherit flex items-center p-2' to={'workflow-list'}>
        <HiSquare3Stack3D size={16} /> flux de travail
      </Link>
    </li>,

    <li
      key='8'
      className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
      onClick={() => handleSidebarClick('Configuration de workflow')}
    >
      <Link className='text-inherit flex items-center p-2' to={'workflow-list'}>
        <HiMiniChartPie size={16} /> Reporting
      </Link>
    </li>,
    <li
      key='8'
      className='hover:bg-secondary/40 rounded transition duration-200 ease-in-out'
      onClick={() => handleSidebarClick('Configuration de workflow')}
    >
      <Link className='text-inherit flex items-center p-2' to={'tree-view'}>
        <HiMiniCog6Tooth size={16} /> Parametres
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
