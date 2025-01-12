// src/components/Sidebar.js
import React from 'react';
import '../styles/Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h3>Team Members</h3>
      <ul className="member-list">
        <li>
          <img src="/avatar1.png" alt="User" /> Alice - Developer
        </li>
        <li>
          <img src="/avatar2.png" alt="User" /> Bob - Designer
        </li>
      </ul>

      <h3>Task Checklist</h3>
      <ul className="task-list">
        <li>
          <input type="checkbox" /> Design Wireframe
        </li>
        <li>
          <input type="checkbox" /> API Development
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
