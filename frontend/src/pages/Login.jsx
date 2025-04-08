import React from 'react';

const Login = () => {
  return (
    <div className='p-3 space-y-3 md:mt-0 sm:max-w-md xl:p-0 xl:mt-10 xl:max-w-none xl:w-96 mx-auto md:h-screen px-6 py-8'>
      <div className='w-full card'>
        <div className='border border-base-200 rounded-lg  '>
          <div className='flex flex-col items-center space-y-3 mb-2.5'>
            <h3 className='text-base text-base-300 font-normal leading-6 pt-3'>
              Votre espace document intelligente
            </h3>

            <h1 className='text-xl font-semibold leading-normal tracking-normal'>
              Connexion
            </h1>
          </div>
          <form className='space-y-4 md:space-y-4 card-body ' action='#'>
            <div>
              <label
                htmlFor='username'
                className='block mb-0 text-md font-medium text-base-300'
              >
                Nom d&apos;utilisateur
              </label>
              <input
                name='username'
                id='username'
                type='text'
                placeholder=''
                className='bg-base-200/10 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5'
              />
            </div>
            <div>
              <label
                htmlFor='password'
                className='block mb-0 text-md font-medium text-base-300'
              >
                Mot de passe
              </label>
              <input
                name='password'
                id='password'
                type='password'
                placeholder=''
                className='bg-base-200/10 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5'
              />
            </div>

            <div className='flex flex-col items-center gap-2'>
              <span id='forgetpasswordlink' className='text-base text-primary'>
                Mot de passe oublie?
              </span>
              <button className='w-full rounded bg-neutral text-base text-neutral-content p-1.5 '>
                Se connecter
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className=' flex items-center justify-items-start w-full p-3 bg-secondary rounded-2xl'>
        <div className='text-primary mr-4'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='size-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z'
            />
          </svg>
        </div>

        <div>
          <h3 className='text-base text-secondary-content font-bold'>
            Vous n&apos;avez pas de compte ?
          </h3>
          <a href='#' className='text-primary underline '>
            Creer un compte
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
