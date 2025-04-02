import React from 'react';
import 'cally';

const Acceuil = () => {
  return (
    <div className='content w-full flex justify-center  space-x-3.5'>
      <calendar-date className='cally bg-base-100 border  border-base-300/50  rounded-box'>
        <svg
          aria-label='Previous'
          className='fill-current size-4'
          slot='previous'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
        >
          <path fill='currentColor' d='M15.75 19.5 8.25 12l7.5-7.5'></path>
        </svg>
        <svg
          aria-label='Next'
          className='fill-current size-4'
          slot='next'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
        >
          <path fill='currentColor' d='m8.25 4.5 7.5 7.5-7.5 7.5'></path>
        </svg>
        <calendar-month></calendar-month>
      </calendar-date>

      <div className='grid grid-cols-2 grid-rows-2 gap-4'>
        <div className='card card-border  border-base-300/50 w-full'>
          <div className='stats'>
            <div className='stat'>
              <div className='stat-title'>Acceptes</div>{' '}
              <div className='stat-value'>23</div>{' '}
              <div className='stat-desc flex items-center gap-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='size-4 text-success'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                  />
                </svg>
                21% plus que le mois dernier
              </div>
            </div>
          </div>
        </div>
        <div className='card card-border  border-base-300/50 w-full'>
          <div className='stats'>
            <div className='stat'>
              <div className='stat-title'>Refuses</div>{' '}
              <div className='stat-value'>4</div>{' '}
              <div className='stat-desc flex items-center gap-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='size-4 text-error'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z'
                  />
                </svg>
                Docuements refuses
              </div>
            </div>
          </div>
        </div>
        <div className='card card-border  border-base-300/50 w-full'>
          <div className='stats'>
            <div className='stat'>
              <div className='stat-title'>En attente</div>{' '}
              <div className='stat-value'>1</div>{' '}
              <div className='stat-desc flex items-center gap-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='size-4 text-warning'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                  />
                </svg>
                Documents en attente
              </div>
            </div>
          </div>
        </div>

        <div className='card card-border  border-base-300/50 w-full'>
          <div className='stats'>
            <div className='stat'>
              <div className='stat-title'>mars Revenue</div>{' '}
              <div className='stat-value'>$32,400</div>{' '}
              <div className='stat-desc flex items-center gap-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 16 16'
                  fill='currentColor'
                  className='text-success size-4'
                >
                  <path
                    fillRule='evenodd'
                    d='M9.808 4.057a.75.75 0 0 1 .92-.527l3.116.849a.75.75 0 0 1 .528.915l-.823 3.121a.75.75 0 0 1-1.45-.382l.337-1.281a23.484 23.484 0 0 0-3.609 3.056.75.75 0 0 1-1.07.01L6 8.06l-3.72 3.72a.75.75 0 1 1-1.06-1.061l4.25-4.25a.75.75 0 0 1 1.06 0l1.756 1.755a25.015 25.015 0 0 1 3.508-2.85l-1.46-.398a.75.75 0 0 1-.526-.92Z'
                    clipRule='evenodd'
                  ></path>
                </svg>{' '}
                21% more than last month
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Acceuil;
