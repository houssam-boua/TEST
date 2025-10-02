import React from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const Header = ({ username }) => {
  return (
    <div className='flex items-center justify-between pt-5 px-4'>
      <div className='flex-1 inline-flex items-center'>
        <div className='mr-10 lg:mr-3'>
          <Button
            variant='default'
            size='sm'
            className='p-3 shadow-none items-center lg:hidden'
            onClick={() => document.getElementById('my-drawer-2')?.click()}
          >
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
                d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
              />
            </svg>
          </Button>
        </div>

        <div className='flex items-center gap-2'>
          <div className='relative flex items-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='absolute left-3 size-4 text-muted-foreground'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
              />
            </svg>
            <Input
              type='search'
              className='pl-10 pr-4'
              placeholder='Chercher des documents'
            />
          </div>
          <Button variant='secondary' size='sm'>
            Chercher
          </Button>
        </div>
      </div>

      <div className='flex gap-2 items-center'>
        <div className='relative'>
          <span className='absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full'></span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='size-5 text-muted-foreground'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0'
            />
          </svg>
        </div>
        <div className='flex justify-center items-center mx-3'>
          <span className='text-sm text-muted-foreground'>{username}</span>
        </div>

        <div className='relative group'>
          <Button variant='ghost' size='sm' className='rounded-full p-2'>
            <div className='w-8 h-8 rounded-full overflow-hidden'>
              <img
                alt='Avatar'
                src='https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
                className='w-full h-full object-cover'
              />
            </div>
          </Button>
          <div className='absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
            <div className='py-2'>
              <a
                href='#'
                className='flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100'
              >
                Profile
                <span className='bg-primary text-primary-foreground text-xs px-2 py-1 rounded'>
                  New
                </span>
              </a>
              <a href='#' className='block px-4 py-2 text-sm hover:bg-gray-100'>
                Settings
              </a>
              <a href='#' className='block px-4 py-2 text-sm hover:bg-gray-100'>
                Logout
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
