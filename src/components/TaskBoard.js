import React, { useState } from 'react';
import '../styles/TaskBoard.css';

const initialTasks = [
  { id: 1, name: 'Design Wireframes', status: 'Draft', assignee: 'Alice', dueDate: '2025-02-01', progress: 20 },
  { id: 2, name: 'Develop API', status: 'In Progress', assignee: 'Bob', dueDate: '2025-02-10', progress: 50 },
  { id: 3, name: 'UI Testing', status: 'Editing', assignee: 'Charlie', dueDate: '2025-02-15', progress: 75 },
  { id: 4, name: 'Release', status: 'Done', assignee: 'Dave', dueDate: '2025-02-20', progress: 100 },
];

const TaskBoard = () => {
  const [tasks, setTasks] = useState(initialTasks);

  const statuses = ['Draft', 'In Progress', 'Editing', 'Done'];

  const onDragStart = (event, task) => {
    event.dataTransfer.setData('task', JSON.stringify(task));
  };

  const onDrop = (event, status) => {
    const task = JSON.parse(event.dataTransfer.getData('task'));
    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, status } : t
    );
    setTasks(updatedTasks);
  };

  const onDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="task-board">
      {statuses.map((status) => (
        <div
          key={status}
          className="task-column"
          onDrop={(e) => onDrop(e, status)}
          onDragOver={onDragOver}
        >
          <div className="task-column-header">
            {status} ({tasks.filter((task) => task.status === status).length})
          </div>
          <div className="task-column-body">
            {tasks
              .filter((task) => task.status === status)
              .map((task) => (
                <div
                  key={task.id}
                  className="task-card"
                  draggable
                  onDragStart={(e) => onDragStart(e, task)}
                >
                  <div className="task-name">{task.name}</div>
                  <div className="task-assignee">{task.assignee}</div>
                  <div className="task-due-date">Due: {task.dueDate}</div>
                  <div className="task-progress-bar">
                    <div
                      className="task-progress"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskBoard;
