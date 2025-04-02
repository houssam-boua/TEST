import React from 'react';

const Breadcrumbs = ({ crumbs }) => {
  return (
    <div className='breadcrumbs text-sm px-5 pt-5'>
      <ul>
        {crumbs.map((crumb, index) => (
          <li key={index}>
            {index < crumbs.length - 1 ? <a>{crumb}</a> : <span>{crumb}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Breadcrumbs;
