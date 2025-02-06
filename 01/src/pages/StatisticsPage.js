import React, { useState } from 'react';

import Statistics from '../components/Statistics';
import '../styles/Statistics.css';
import ActivityFeed from '../components/ActivityFeed';
import FilterAndSearch from '../components/FilterAndSearch';


const sampleActivities = [
  { time: '10:30 AM', message: 'Task "Design Phase" marked as completed.', important: false },
  { time: '9:45 AM', message: 'New task "Testing Phase" added by John Doe.', important: false },
  { time: '9:00 AM', message: 'Deadline approaching for "Development Phase".', important: true, link: '#' },
];

const sampleTeamMembers = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Frontend Developer',
    avatar: 'https://via.placeholder.com/60',
    totalTasks: 10,
    completedTasks: 7,
    progress: 70,
    color: '#4B70E2',
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Backend Developer',
    avatar: 'https://via.placeholder.com/60',
    totalTasks: 8,
    completedTasks: 6,
    progress: 75,
    color: '#FFA500',
  },
  {
    id: 3,
    name: 'Emily Johnson',
    role: 'UI/UX Designer',
    avatar: 'https://via.placeholder.com/60',
    totalTasks: 12,
    completedTasks: 9,
    progress: 75,
    color: '#32CD32',
  },
];


const StatisticsPage = ({ tasks = [] }) => {  // 기본값 추가
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const handleFilter = (filtered) => {
    setFilteredTasks(filtered);
  };

  
  return (
    <div className="statistics-page">
        <FilterAndSearch tasks={tasks} onFilter={handleFilter} />
        <Statistics tasks={filteredTasks} />
      <ActivityFeed activities={sampleActivities} />
    </div>
  );
};

export default StatisticsPage;
