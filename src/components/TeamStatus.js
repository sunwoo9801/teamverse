import React from 'react';
import '../styles/TeamStatus.css';

const TeamStatus = ({ teamMembers = [] }) => {
  return (
    <div className="team-status">
      <h3 className="team-status-title">Team Status</h3>
      <div className="team-list">
        {teamMembers.map((member) => (
          <div key={member.id} className="team-card">
            <img src={member.avatar} alt={`${member.name}'s avatar`} className="team-avatar" />
            <div className="team-info">
              <h4 className="team-name">{member.name}</h4>
              <p className="team-role">{member.role}</p>
              <div className="team-progress">
                <div className="progress-bar-team">
                  <div className="progress-team" style={{ width: `${member.progress}%`, backgroundColor: member.color }}></div>
                </div>
                <span className="progress-text">{member.completedTasks}/{member.totalTasks} tasks completed</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamStatus;
