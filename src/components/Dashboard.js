import React, { useState } from 'react';
import { FaTasks, FaUsers, FaChartPie, FaClipboardList } from 'react-icons/fa';
import TaskBoard from './TaskBoard';
import ActivityFeed from './ActivityFeed';
import '../styles/Dashboard.css';

const Dashboard = ({ tasks }) => {
  const [filteredTasks, setFilteredTasks] = useState(tasks);

  const handleFilter = (filtered) => {
    setFilteredTasks(filtered);
  };

  return (
    <div className="dashboard">
      {/* 대시보드 카드 (상단) */}
      <div className="dashboard-header">
        <div className="dashboard-card">
          <FaTasks className="dashboard-icon" />
          <h3>{tasks.length}</h3>
          <p>Total Tasks</p>
        </div>
        <div className="dashboard-card">
          <FaUsers className="dashboard-icon" />
          <h3>5</h3>
          <p>Team Members</p>
        </div>
        <div className="dashboard-card">
          <FaChartPie className="dashboard-icon" />
          <h3>{tasks.filter(task => task.status === "Done").length}</h3>
          <p>Completed Tasks</p>
        </div>
        <div className="dashboard-card">
          <FaClipboardList className="dashboard-icon" />
          <h3>{tasks.filter(task => task.status === "In Progress").length}</h3>
          <p>In Progress</p>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
