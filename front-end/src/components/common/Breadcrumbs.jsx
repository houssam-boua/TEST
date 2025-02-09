// src/components/common/Breadcrumbs.js

import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="breadcrumbs text-xs  font-medium text-secondary-content ">
      <ul className="flex   text-center ml-1">
        <li>
          <Link to="/" className="hover:underline text-primary">
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={to}>
              {isLast ? (
                <span className="text-gray-500">{value}</span>
              ) : (
                <Link to={to} className="hover:underline text-primary">
                  {value}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
