// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">TeamVerse</div>
      <div className="navbar-menu">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/files">Files</Link>
        <Link to="/roles">Roles</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/login" className="login-button">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;
