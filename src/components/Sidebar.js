import React from 'react';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const teamMembers = [
    { id: 1, name: 'Alice', role: 'Developer', avatar: 'https://i.pravatar.cc/50?u=1' },
    { id: 2, name: 'Bob', role: 'Designer', avatar: 'https://i.pravatar.cc/50?u=2' },
  ];

  return (
    <div className="sidebar">
      <h3>Team Members</h3>
      <ul>
        {teamMembers.map((member) => (
          <li key={member.id}>
            <img src={member.avatar} alt={member.name} />
            <div>
              <p>{member.name}</p>
              <small>{member.role}</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
