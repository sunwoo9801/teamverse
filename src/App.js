import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import StatisticsPage from './pages/StatisticsPage';
import TeamStatusPage from './pages/TeamStatusPage';

const tasks = [
  { id: 1, name: 'Design Phase', status: 'Done', dueDate: '2025-01-30', assignee: 'Alice' },
  { id: 2, name: 'Development Phase', status: 'In Progress', dueDate: '2025-02-05', assignee: 'Bob' },
  { id: 3, name: 'Testing Phase', status: 'In Progress', dueDate: '2025-02-10', assignee: 'Charlie' },
];

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/statistics" element={<StatisticsPage tasks={tasks} />} /> {/* tasks 전달 */}
          <Route path="/team-status" element={<TeamStatusPage />} /> {/* 팀 상태 페이지 추가 */}
      
        </Routes>
      </div>
    </Router>
  );
}

export default App;
