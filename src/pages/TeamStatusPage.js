import React from 'react';
import { FaUsers, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import TeamStatus from '../components/TeamStatus';  // TeamStatus 컴포넌트 가져오기
import '../styles/TeamStatusPage.css';

const sampleTeamMembers = [
  { id: 1, name: 'Alice', role: 'Frontend Developer', avatar: 'https://i.pravatar.cc/60?u=1', totalTasks: 10, completedTasks: 7, progress: 70, color: '#4B70E2' },
  { id: 2, name: 'Bob', role: 'Backend Developer', avatar: 'https://i.pravatar.cc/60?u=2', totalTasks: 8, completedTasks: 6, progress: 75, color: '#FFA500' },
];

const TeamStatusPage = () => {
  return (
    <div className="team-status-page">
      {/* 상단 팀 개요 (통계 카드) */}
      <div className="team-summary">
        <div className="team-card">
          <FaUsers className="team-icon" />
          <h3>{sampleTeamMembers.length}</h3>
          <p>Total Members</p>
        </div>
        <div className="team-card">
          <FaCheckCircle className="team-icon" />
          <h3>{sampleTeamMembers.reduce((sum, member) => sum + member.completedTasks, 0)}</h3>
          <p>Completed Tasks</p>
        </div>
        <div className="team-card">
          <FaClipboardList className="team-icon" />
          <h3>{sampleTeamMembers.reduce((sum, member) => sum + (member.totalTasks - member.completedTasks), 0)}</h3>
          <p>Pending Tasks</p>
        </div>
      </div>

      {/* 팀원별 상태를 보여주는 TeamStatus 컴포넌트 */}
      <TeamStatus teamMembers={sampleTeamMembers} />
    </div>
  );
};

export default TeamStatusPage;
