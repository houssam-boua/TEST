import React from 'react';

const Sidebar = ({ children, sidebarContent }) => {
  return (
    <div className="drawer lg:drawer-open ">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-start justify-start">
        <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button items-start lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </label>
                {children}

      </div>
      <div className="drawer-side font-lato">

        <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu bg-neutral text-neutral-content text-md min-h-full w-64 p-4">
                  <img src="/gedlogo.svg" alt="logo" className="mb-10" />

          {sidebarContent ? sidebarContent : (
            <>
              {/* Default Sidebar content */}
              <li><a>Sidebar Item 1</a></li>
              <li><a>Sidebar Item 2</a></li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
