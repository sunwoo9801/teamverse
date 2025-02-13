import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import MainPage from './pages/MainPage';
import Navbar from './components/Navbar';
import StatisticsPage from './pages/StatisticsPage';
import TeamStatusPage from './pages/TeamStatusPage';
import LoginPage from "./components/LoginPage";
import SessionTimeout from "./components/SessionTimeout"; // 자동 세션 관리
import LandingPage from './components/LandingPage';
import TaskPage from './pages/TaskPage';


const tasks = [
  { id: 1, name: 'Design Phase', status: 'Done', dueDate: '2025-01-30', assignee: 'Alice' },
  { id: 2, name: 'Development Phase', status: 'In Progress', dueDate: '2025-02-05', assignee: 'Bob' },
  { id: 3, name: 'Testing Phase', status: 'In Progress', dueDate: '2025-02-10', assignee: 'Charlie' },
];


function App() {
  return (
    <Router>
      <SessionTimeout /> {/* 자동 로그인 연장 또는 로그아웃 감지 */}
      <MainLayout />
    </Router>
  );
}

function MainLayout() {
  const location = useLocation(); // 현재 경로 확인
  const hideNavbar = location.pathname === "/login"; // 로그인 페이지에서는 Navbar 숨김

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />{/* 페이지 추가 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/:userId" element={<MainPage />} /> {/* 수정: MainPage 경로 변경 */}
        {/* <Route path="/login" element={<AuthPage/>} /> */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/statistics" element={<StatisticsPage tasks={tasks} />} /> {/* tasks 전달 */}
        <Route path="/team-status" element={<TeamStatusPage />} /> 
        <Route path="/task" element={<TaskPage />} /> 
      </Routes>
    </>
  );
}


export default App;
