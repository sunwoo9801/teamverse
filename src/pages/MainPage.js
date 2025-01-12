// src/pages/MainPage.js
import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import GanttChart from '../components/GanttChart';
import Chatbox from '../components/Chatbox';
import '../styles/MainPage.css';

const MainPage = () => {
  return (
    <div className="main-page">
      <Navbar />
      <div className="main-layout">
        <Sidebar />
        <GanttChart />
        <Chatbox />
      </div>
    </div>
  );
};

export default MainPage;
