import React from 'react';

const Unauthorized = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-4xl font-bold mb-4'>Unauthorized</h1>
      <p className='text-lg mb-8'>
        You do not have permission to access this page.
      </p>
      <a href='/' className='text-blue-500 hover:underline'>
        Go back to home
      </a>
    </div>
  );
};
export default Unauthorized;