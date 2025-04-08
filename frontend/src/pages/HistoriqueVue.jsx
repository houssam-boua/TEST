import React from 'react'
import Table from '../component/Table';
import { HiArrowSmallLeft } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import Toolbar from '../component/Toolbar';

const HistoriqueVue = () => {

    const sidebarContent = [
      {
        key: 'ajouter',
        content: (
          <li className=''>
            <Link
              className='text-inherit flex items-center'
            >
              <HiArrowSmallLeft size={16} />
              Revenir au tableau
            </Link>
          </li>
        ),
      },
    ];
  const headers = ['Nom du document', "Date d'ajout", 'Statut'];

  // Dynamic rows (data)
  const rows = [
    ['John Doe', '12/02/2002', 'success'],
    ['Jane Smith', 34, 'error'],
    ['Sam Green', 22, 'en attente'],
  ];

  // Handle selected rows
  const handleSelectedRows = (selectedRows) => {
    console.log('Selected Rows:', selectedRows);
  };

  return (
    <>
      <Toolbar toolBarItems={sidebarContent.map((item) => item.content)} />
      <Table headers={headers} rows={rows} onSelect={handleSelectedRows} />
    </>
  );
};

export default HistoriqueVue
