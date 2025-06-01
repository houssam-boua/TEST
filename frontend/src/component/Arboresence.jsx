// components/Arborescence.jsx
import { Link } from 'react-router-dom';
import React from 'react';

const RootIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='currentColor'
    className='size-4 fill-neutral '
  >
    <path d='M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648l8.628 5.033Z' />
  </svg>
);

const FolderIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='currentColor'
    className='size-4 fill-primary'
  >
    <path d='M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z' />
  </svg>
);

const FileIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className='size-4 text-primary'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z'
    />
  </svg>
);

const TreeNode = ({ node, pathname, isRoot = false, onFileClick }) => {
  if (node.children) {
    return (
      <details>
        <summary className='text-sm flex items-center gap-2 cursor-pointer hover:underline'>
          {isRoot ? <RootIcon /> : <FolderIcon />}
          {node.name}
        </summary>
        <ul className='text-sm pl-6 pt-1 space-y-1 relative before:content-[""] before:absolute before:left-2 before:top-3 before:bottom-3 before:w-px before:bg-base-content/10'>
          {node.children.map((child) => (
            <li key={child.path || child.name} className='relative'>
              <TreeNode
                node={child}
                pathname={pathname}
                onFileClick={onFileClick}
              />
            </li>
          ))}
        </ul>
      </details>
    );
  }

  return (
    <div
      onClick={() => onFileClick(node)}
      className={`block rounded-md cursor-pointer ${
        pathname === node.path ? 'bg-primary/15 text-primary' : ''
      }`}
    >
      <div className='flex gap-1'>
        <div className='flex-shrink-0 pt-0.5'>
          <FileIcon />
        </div>
        <span className='whitespace-normal break-words'>{node.name}</span>
      </div>
    </div>
  );
};

const Arborescence = ({ data, pathname, onFileClick }) => {
  return (
    <div className='w-xs h-fit max-h-96 overflow-y-scroll  p-4 flex flex-col rounded-md resize-x overflow-auto cursor-e-resize bg-base-300'>
      {data.map((node) => (
        <TreeNode
          key={node.path || node.name}
          node={node}
          pathname={pathname}
          isRoot={true}
          onFileClick={onFileClick}
        />
      ))}
    </div>
  );
};

export default Arborescence;
