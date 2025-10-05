import React from "react";
import { Outlet, Link } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="public-layout">
      {/* <header className="public-header">
        <div className="logo">App Name</div>
        <nav className="public-nav">
          <ul>
            <li>
              <Link to="/login">Login</Link>
            </li>
            
          </ul>
        </nav>
      </header> */}

      <main className="public-content">
        <Outlet />
      </main>

      {/* <footer className="public-footer">
        <p>© {new Date().getFullYear()} Your Company</p>
      </footer> */}
    </div>
  );
};

export default PublicLayout;
