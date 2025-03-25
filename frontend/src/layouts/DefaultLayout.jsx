import React from 'react';
import Sidebar from '../component/Sidebar';
import Header from '../component/Header';
import Breadcrumbs from '../component/Breadcrumbs';
import { Outlet } from 'react-router-dom';

const DefaultLayout = ({ sidebarContent, breadcrumbs, username }) => {
  return (
    <>
      <Sidebar sidebarContent={sidebarContent}>
        <Header username={username} />
        <Breadcrumbs crumbs={breadcrumbs} />
        <Outlet />
      </Sidebar>
    </>
  );
};

export default DefaultLayout;
