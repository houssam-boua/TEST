import React from 'react';
import Navbar from '../components/common/Navbar';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

const AdminLayout = () => {
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content  flex-col bg-white">
        <Navbar />

        <div>
          <Outlet />
        </div>
      </div>

      <Sidebar />
    </div>
  );
};

export default AdminLayout;