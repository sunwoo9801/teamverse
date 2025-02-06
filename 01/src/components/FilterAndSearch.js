import React, { useState } from 'react';
import '../styles/FilterAndSearch.css';

const FilterAndSearch = ({ tasks, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(value, statusFilter, priorityFilter);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    applyFilters(searchTerm, value, priorityFilter);
  };

  const handlePriorityChange = (e) => {
    const value = e.target.value;
    setPriorityFilter(value);
    applyFilters(searchTerm, statusFilter, value);
  };

  const applyFilters = (search, status, priority) => {
    const filteredTasks = tasks.filter((task) => {
      const matchesSearch = task.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status ? task.status === status : true;
      const matchesPriority = priority ? task.priority === priority : true;
      return matchesSearch && matchesStatus && matchesPriority;
    });
    onFilter(filteredTasks);
  };

  return (
    <div className="filter-and-search">
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />
      <select value={statusFilter} onChange={handleStatusChange} className="filter-select">
        <option value="">All Statuses</option>
        <option value="Draft">Draft</option>
        <option value="In Progress">In Progress</option>
        <option value="Editing">Editing</option>
        <option value="Done">Done</option>
      </select>
      <select value={priorityFilter} onChange={handlePriorityChange} className="filter-select">
        <option value="">All Priorities</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>
  );
};

export default FilterAndSearch;
