import React from 'react';
import NestedTable from '../component/Table/NestedTable';
import Toolbar from '../component/Toolbar';
import { Link } from 'react-router-dom';
import {
  HiArrowDownTray,
  HiCube,
  HiOutlineRectangleGroup,
  HiQueueList,
  HiRectangleGroup,
} from 'react-icons/hi2';
import {
  FiFolder,
  FiFile,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import Filters from '../component/Filters';

const ConsulteFolders = () => {
  const documentsData = [
    {
      id: 'folder1',
      name: 'Project Documents',
      type: 'folder',
      lastModified: '2023-05-15',
      size: '--',
      children: [
        {
          id: 'doc1',
          name: 'Requirements.docx',
          type: 'file',
          lastModified: '2023-05-10',
          size: '2.4 MB',
        },
        {
          id: 'doc2',
          name: 'Specifications.pdf',
          type: 'file',
          lastModified: '2023-05-12',
          size: '5.1 MB',
        },
      ],
    },
    {
      id: 'folder2',
      name: 'Financial Reports',
      type: 'folder',
      lastModified: '2023-05-18',
      size: '--',
      children: [
        {
          id: 'doc3',
          name: 'Q1-2023.xlsx',
          type: 'file',
          lastModified: '2023-04-30',
          size: '3.2 MB',
        },
        {
          id: 'doc4',
          name: 'Q2-2023.xlsx',
          type: 'file',
          lastModified: '2023-05-15',
          size: '3.5 MB',
        },
      ],
    },
    {
      id: 'doc5',
      name: 'README.md',
      type: 'file',
      lastModified: '2023-05-20',
      size: '0.1 MB',
    },
  ];

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

  const data = [
    {
      id: 'folder1',
      name: 'Documents',
      type: 'folder',
      children: [
        { id: 'file1', name: 'Document1.pdf', type: 'file' },
        { id: 'file2', name: 'Document2.docx', type: 'file' },
      ],
    },
    {
      id: 'folder2',
      name: 'Documents',
      type: 'folder',
      children: [
        { id: 'file13', name: 'Document1.pdf', type: 'file' },
        { id: 'file32', name: 'Document2.docx', type: 'file' },
      ],
    },
  ];

  const columns = [
    { key: 'type', label: 'Type' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => <button className='btn btn-xs'>View</button>,
    },
  ];

  const customIcons = {
    folder: <FiFolder className='text-yellow-500' />,
    file: <FiFile className='text-blue-500' />,
    expand: <FiChevronRight />,
    collapse: <FiChevronDown />,
  };

  return (
    <>
      <Toolbar toolBarItems={sidebarContent.map((item) => item.content)} />
      <Filters />
      <NestedTable
        data={documentsData}
        columns={columns}
        icons={customIcons}
        containerClassName='rounded-lg'
        onRowSelect={(selectedIds) => console.log('Selected:', selectedIds)}
        onRowExpand={(rowId, isExpanded) =>
          console.log('Row expanded:', rowId, isExpanded)
        }
      />
    </>
  );
};

export default ConsulteFolders;
