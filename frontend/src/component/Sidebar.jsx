import React from 'react';

const Sidebar = ({ children, sidebarContent }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static lg:translate-x-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50 lg:z-auto`}
      >
        <div className='flex flex-col bg-gray-900 text-white min-h-screen w-64 font-lato'>
          <div className='p-4'>
            <img src='/gedlogo.svg' alt='logo' className='mb-10' />
          </div>

          <nav className='flex-1 px-4'>
            {sidebarContent ? (
              sidebarContent
            ) : (
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#'
                    className='block px-4 py-2 rounded-md hover:bg-gray-700 transition-colors'
                  >
                    Sidebar Item 1
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='block px-4 py-2 rounded-md hover:bg-gray-700 transition-colors'
                  >
                    Sidebar Item 2
                  </a>
                </li>
              </ul>
            )}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 flex flex-col overflow-hidden lg:ml-0'>
        {/* Hidden checkbox for drawer toggle */}
        <input
          id='my-drawer-2'
          type='checkbox'
          className='hidden'
          checked={isOpen}
          onChange={(e) => setIsOpen(e.target.checked)}
        />

        <main className='flex-1 overflow-auto'>{children}</main>
      </div>
    </div>
  );
};

export default Sidebar;
