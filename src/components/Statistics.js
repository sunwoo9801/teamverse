import React from 'react';
import '../styles/Statistics.css';

const Statistics = ({ tasks = [] }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'Done').length;
  const draftTasks = tasks.filter((task) => task.status === 'Draft').length;
  const inProgressTasks = tasks.filter((task) => task.status === 'In Progress').length;
  const editingTasks = tasks.filter((task) => task.status === 'Editing').length;

  const completedPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const upcomingTasks = tasks
    .filter((task) => new Date(task.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  return (
    <div className="statistics">
      <div className="stats-progress-card">
        <div className="stats-progress-circle">
          <svg width="120" height="120">
            <circle cx="60" cy="60" r="50" className="stats-progress-background" />
            <circle
              cx="60"
              cy="60"
              r="50"
              className="stats-progress-bar"
              style={{ strokeDasharray: `${completedPercentage} 100` }}
            />
          </svg>
          <div className="stats-progress-label">
            {Math.round(completedPercentage)}%
          </div>
        </div>
        <div className="stats-progress-text">Tasks Completed</div>
      </div>

      <div className="stats-status-summary">
        <div className="stats-status-card">
          <div className="stats-status-count">{draftTasks}</div>
          <div className="stats-status-label">Draft</div>
        </div>
        <div className="stats-status-card">
          <div className="stats-status-count">{inProgressTasks}</div>
          <div className="stats-status-label">In Progress</div>
        </div>
        <div className="stats-status-card">
          <div className="stats-status-count">{editingTasks}</div>
          <div className="stats-status-label">Editing</div>
        </div>
        <div className="stats-status-card">
          <div className="stats-status-count">{completedTasks}</div>
          <div className="stats-status-label">Done</div>
        </div>
      </div>

      <div className="stats-upcoming-tasks">
        <h3>Upcoming Deadlines</h3>
        <ul>
          {upcomingTasks.map((task) => (
            <li key={task.id}>
              <strong>{task.name}</strong> - Due: {task.dueDate}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Statistics;
