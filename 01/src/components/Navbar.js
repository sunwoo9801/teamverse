import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">TeamVerse</div>
      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/statistics">Statistics</Link>
        <Link to="/team-status">Team</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/login" className="login-btn">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;