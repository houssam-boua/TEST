import React from 'react';

const Toolbar = ({ toolBarItems }) => {
  return (
    <>
      <div className='pl-6 toolbar w-full bg-secondary/30 text-primary border-b border-base-content/5'>
        <ul className='menu menu-xs menu-horizontal'>
          {toolBarItems ? (
            toolBarItems
          ) : (
            <>
              <li>
                <a>Titre 1 par defaut </a>
              </li>
              <li>
                <a>Titre 1 par defaut </a>
              </li>
              <li>
                <a>Titre 1 par defaut </a>
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  );
};

export default Toolbar;
