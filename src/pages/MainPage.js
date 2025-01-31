import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import GanttChart from '../components/GanttChart';
import Chatbox from '../components/Chatbox';
import Dashboard from '../components/Dashboard';
import FilterAndSearch from '../components/FilterAndSearch';
import TaskBoard from '../components/TaskBoard';
import ActivityFeed from '../components/ActivityFeed';
import '../styles/MainPage.css';

const tasks = [
  { id: 1, name: 'Design Phase', status: 'Done', dueDate: '2025-01-30', assignee: 'Alice' },
  { id: 2, name: 'Development Phase', status: 'In Progress', dueDate: '2025-02-05', assignee: 'Bob' },
  { id: 3, name: 'Testing Phase', status: 'In Progress', dueDate: '2025-02-10', assignee: 'Charlie' },
];

const MainPage = () => {
  const [filteredTasks, setFilteredTasks] = useState(tasks);

  const handleFilter = (filtered) => {
    setFilteredTasks(filtered);
  };

  return (
    <div className="main-page">
      <div className="content">
        <GanttChart tasks={filteredTasks} />
        <TaskBoard />  {/* 작업 보드 추가 */}
        <Dashboard tasks={filteredTasks} />
      </div>
      <div className="chatbox-container">
        <Sidebar />
        <Chatbox />
      </div>
    </div>
  );
};

export default MainPage;
