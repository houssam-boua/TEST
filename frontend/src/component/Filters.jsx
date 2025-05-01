import React from 'react';

const Filters = () => {
  return (
    <div className='pl-10 py-3 toolbar w-full bg-secondary/15 text-primary border-b border-base-content/5 space-x-5 flex items-center just'>
      <label className='input input-sm flex items-center gap-2'>
        <svg
          className='h-[1em] opacity-50'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
        >
          <g
            strokeLinejoin='round'
            strokeLinecap='round'
            strokeWidth='2.5'
            fill='none'
            stroke='currentColor'
          >
            <circle cx='11' cy='11' r='8'></circle>
            <path d='m21 21-4.3-4.3'></path>
          </g>
        </svg>
        <input
          type='search'
          className='grow'
          placeholder='Que cherchez-vous? ...'
        />
      </label>
      <select className='select select-sm w-fit ' defaultValue=''>
        <option value='' disabled>
          Selectionner le type
        </option>

        <option>Personal</option>
        <option>Business</option>
      </select>

      <input type='date' className='input input-sm w-fit' />
      <div className='grid grid-cols-2 gap-2'>
        <button className='btn btn-sm btn-neutral p-2 text-xs font-normal'>
          Chercher
        </button>
        <button className='btn btn-sm p-2 text-xs font-normal'>Effacer</button>

      </div>
    </div>
  );
};

export default Filters;
