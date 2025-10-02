import React, { useEffect, useState } from 'react';
import NestedTable from '../component/Table/NestedTable';
import Toolbar from '../component/Toolbar';
import { Link } from 'react-router-dom';
import { HiCube, HiOutlineEye } from 'react-icons/hi2';
import Filters from '../component/Filters';
import { getDocuments } from '../services/documentsServices';
import { getFormatIcon } from '../Helpers/getFormatIcon';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const ConsulteDocs = () => {
  const [documents, setDocuments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDoc, setSelectedDoc] = useState(null);

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

  const handleViewDoc = (doc) => {
    setSelectedDoc(doc);
    document.getElementById('doc_view_modal').showModal();
  };

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
        <Badge variant={row.doc_status === 'Active' ? 'success' : 'error'}>
          {row.doc_status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button
          variant='secondary'
          size='xs'
          onClick={() => handleViewDoc(row)}
        >
          <HiOutlineEye />
        </Button>
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
      />
      {/* Modal for document view */}
      <dialog id='doc_view_modal' className='modal'>
        <div className='modal-box'>
          {selectedDoc ? (
            <>
              <h3 className='font-bold text-lg mb-2'>
                {selectedDoc.doc_title}
              </h3>
              <div className='mb-2'>
                <span className='font-semibold'>Type:</span>{' '}
                {selectedDoc.doc_format}
              </div>
              <div className='mb-2'>
                <span className='font-semibold'>Categorie:</span>{' '}
                {selectedDoc.doc_category}
              </div>
              <div className='mb-2'>
                <span className='font-semibold'>Description:</span>{' '}
                {selectedDoc.doc_description}
              </div>
              <div className='mb-2'>
                <span className='font-semibold'>Status:</span>{' '}
                {selectedDoc.doc_status}
              </div>
              <div className='mb-2'>
                <span className='font-semibold'>Owner:</span>{' '}
                {selectedDoc.doc_owner}
              </div>
              <div className='mb-2'>
                <span className='font-semibold'>Departement:</span>{' '}
                {selectedDoc.doc_departement}
              </div>
              <div className='mb-2'>
                <span className='font-semibold'>Taille:</span>{' '}
                {selectedDoc.doc_size}
              </div>
              {/* File preview */}
              {(selectedDoc.file || selectedDoc.doc_path) && (
                <div className='mt-4'>
                  <span className='font-semibold'>Aperçu du fichier:</span>
                  <div className='mt-2'>
                    {(() => {
                      const ext = (selectedDoc.doc_format || '').toLowerCase();
                      const fileUrl =
                        selectedDoc.file && typeof selectedDoc.file === 'string'
                          ? selectedDoc.file.startsWith('http')
                            ? selectedDoc.file
                            : `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/${selectedDoc.file}`
                          : selectedDoc.doc_path &&
                              typeof selectedDoc.doc_path === 'string'
                            ? selectedDoc.doc_path.startsWith('http')
                              ? selectedDoc.doc_path
                              : `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/${selectedDoc.doc_path}`
                            : null;
                      if (!fileUrl) return <span>Fichier non disponible</span>;
                      const imageExts = [
                        'jpg',
                        'jpeg',
                        'png',
                        'gif',
                        'bmp',
                        'webp',
                        'tiff',
                        'svg',
                      ];
                      if (imageExts.includes(ext)) {
                        return (
                          <img
                            src={fileUrl}
                            alt={selectedDoc.doc_title}
                            className='max-w-full max-h-64 rounded shadow'
                          />
                        );
                      }
                      if (ext === 'pdf') {
                        return (
                          <iframe
                            src={fileUrl}
                            title='PDF Preview'
                            className='w-full h-64 rounded shadow'
                          />
                        );
                      }
                      if (ext === 'doc' || ext === 'docx') {
                        return (
                          <a
                            href={fileUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='link text-primary'
                          >
                            Ouvrir le document Word
                          </a>
                        );
                      }
                      if (ext === 'xls' || ext === 'xlsx') {
                        return (
                          <a
                            href={fileUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='link text-primary'
                          >
                            Ouvrir le document Excel
                          </a>
                        );
                      }
                      return (
                        <a
                          href={fileUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='link text-primary'
                        >
                          Télécharger / Voir le fichier
                        </a>
                      );
                    })()}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>Chargement...</div>
          )}
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button>close</button>
        </form>
      </dialog>

      <div className='flex items-center justify-center gap-2 m-4'>
        <Button
          variant='secondary'
          size='xs'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          «
        </Button>
        <span className='px-3 py-1 text-sm border rounded'>
          Page {currentPage} / {totalPages || 1}
        </span>
        <Button
          variant='secondary'
          size='xs'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          »
        </Button>
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
