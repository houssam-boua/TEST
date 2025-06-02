import React, { useEffect, useState } from 'react';
import NestedTable from '../component/Table/NestedTable';
import Toolbar from '../component/Toolbar';
import { Link } from 'react-router-dom';
import { HiCube, HiOutlineEye } from 'react-icons/hi2';
import Filters from '../component/Filters';
import { getDocuments } from '../services/documentsServices';
import { getFormatIcon } from '../Helpers/getFormatIcon';

const ConsulteDocs = () => {
  const [documents, setDocuments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await getDocuments();
        setDocuments(docs);
        console.log('Fetched documents:', docs);
      } catch (e) {
        console.error('Error fetching documents:', e);
      }
    };

    fetchDocs();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(documents.length / pageSize);
  const paginatedDocs = documents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const sidebarContent = [
    {
      key: 'ajouter',
      content: (
        <li className=''>
          <Link className='text-inherit flex items-center' to='/a/tree-vue'>
            <HiCube size={16} />
            Vue Hierarchique
          </Link>
        </li>
      ),
    },
  ];

  const columns = [
    { key: 'doc_title', label: 'Titre' },
    {
      key: 'doc_format',
      label: 'Type',
      render: (row) => (
        <span className='flex items-center gap-1'>
          {getFormatIcon(row.doc_format)}
          {row.doc_format}
        </span>
      ),
    },
    { key: 'doc_category', label: 'Categorie' },
    { key: 'doc_owner', label: 'Responsable' },
    { key: 'doc_departement', label: 'Departement' },
    { key: 'doc_size', label: 'Taille' },
    {
      key: 'doc_status',
      label: 'Statut',
      render: (row) => (
        <span
          className={`text-xs rounded-lg badge badge-dash  ${row.doc_status === 'Active' ? 'badge-success' : 'badge-error'}`}
        >
          {row.doc_status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button className='btn btn-xs btn-secondary '>
          <HiOutlineEye />{' '}
        </button>
      ),
    },
  ];

  return (
    <>
      <Toolbar toolBarItems={sidebarContent.map((item) => item.content)} />
      <Filters />
      <NestedTable
        data={paginatedDocs.map((doc) => ({
          ...doc,
          name: doc.doc_title, // for NestedTable's display
          type: 'file', // all are files in flat list
        }))}
        columns={columns}
        containerClassName='rounded-lg'
        showCheckboxes={false}
        // Optionally pass icons if you want custom icons
      />

      <div className='join m-4 display-flex justify-center'>
        <button
          className='join-item btn btn-xs btn-secondary'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          «
        </button>
        <span className='join-item btn btn-xs bt-'>
          Page {currentPage} / {totalPages || 1}
        </span>
        <button
          className='join-item btn btn-xs btn-secondary'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          »
        </button>
        {/* <select
          className='select select-xs ml-4 '
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select> */}
      </div>
    </>
  );
};

export default ConsulteDocs;
