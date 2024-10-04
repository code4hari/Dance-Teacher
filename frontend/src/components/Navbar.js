import React from 'react';
import '../assets/css/navbar.css';
import { Outlet, Link } from "react-router-dom";

function Navbar() {
  return (
    <>
      <nav className="navbar">
        <Link to="https://github.com/RoyceAroc/danceteacher/">GitHub</Link>
      </nav>
      <Outlet />
    </>
    
  );
}

export default Navbar;