import React from "react";
import { Link, Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar"; // Importing the Navbar component
import Sidebar from "../components/common/Sidebar"; // Importing the Sidebar component
import Breadcrumbs from "../components/common/Breadcrumbs";

const Home = () => {
  return (
    <div className="drawer lg:drawer-open ">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex-col bg-white">
        <Navbar />
        <Breadcrumbs /> {/* Add breadcrumbs here */}
        <div className="overflow-hidden text-sm ">
          <Outlet />
        </div>
      </div>

      <Sidebar />
    </div>
  );
};

export default Home;
