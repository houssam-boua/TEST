// components/Arborescence.jsx
import { Link } from 'react-router-dom';
import React from 'react';

const RootIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className='size-5 text-primary'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9'
    />
  </svg>
);

const FolderIcon = () => (
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
      d='M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z'
    />
  </svg>
);

const FileIcon = () => (
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
      d='M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z'
    />
  </svg>
);

const TreeNode = ({ node, pathname, isRoot = false }) => {
  if (node.children) {
    return (
      <details open>
      <summary className='flex items-center gap-2 cursor-pointer hover:underline'>
          {isRoot ? <RootIcon /> : <FolderIcon />}
          {node.name}
        </summary>
        <ul className='pl-4 pt-1 space-y-1 relative before:content-[""] before:absolute before:left-2 before:top-3 before:bottom-3 before:w-px before:bg-base-content/10'>
          {node.children.map((child) => (
            <li key={child.path || child.name} className='relative'>
              <TreeNode node={child} pathname={pathname} />
            </li>
          ))}
        </ul>
      </details>
    );
  }

  return (
    <Link
      to={node.path}
      className={`flex items-center gap-1 rounded-md block ${
        pathname === node.path ? 'bg-primary/15 text-primary' : ''
      }`}
    >
      <FileIcon />
      {node.name}
    </Link>
  );
};

const Arborescence = ({ data, pathname }) => {
  return (
    <div className='w-full border border-base-300/50 p-4 flex flex-col rounded-md'>
      {data.map((node) => (
        <TreeNode
          key={node.path || node.name}
          node={node}
          pathname={pathname}
          isRoot={true}
        />
      ))}
    </div>
  );
};

export default Arborescence;
