import React, { useState } from 'react';
import axios from 'axios';
import '../styles/TaskForm.css';

const TaskForm = ({ onTaskAdded }) => {
  const [task, setTask] = useState({
    name: '',
    startDate: '',
    endDate: '',
    assignee: '',
    progress: 0,
  });

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/tasks', task);
      onTaskAdded(response.data); // 새로운 작업 리스트에 추가
      setTask({ name: '', startDate: '', endDate: '', assignee: '', progress: 0 });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>Add New Task</h3>
      <input type="text" name="name" placeholder="Task Name" value={task.name} onChange={handleChange} required />
      <input type="date" name="startDate" value={task.startDate} onChange={handleChange} required />
      <input type="date" name="endDate" value={task.endDate} onChange={handleChange} required />
      <input type="text" name="assignee" placeholder="Assignee" value={task.assignee} onChange={handleChange} required />
      <input type="number" name="progress" placeholder="Progress (%)" value={task.progress} onChange={handleChange} required min="0" max="100" />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;
