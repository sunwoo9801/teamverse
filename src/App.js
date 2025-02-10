
import React, { useEffect } from 'react'; // useEffect 추가
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import StatisticsPage from './pages/StatisticsPage';
import TeamStatusPage from './pages/TeamStatusPage';
import { refreshToken } from './api/authApi'; // Refresh Token 갱신 함수 추가
import Dashboard from "./pages/Dashboard";
import Chatbox from "./components/Chatbox"; // ✅ Chatbox 추가




const tasks = [
  { id: 1, name: 'Design Phase', status: 'Done', dueDate: '2025-01-30', assignee: 'Alice' },
  { id: 2, name: 'Development Phase', status: 'In Progress', dueDate: '2025-02-05', assignee: 'Bob' },
  { id: 3, name: 'Testing Phase', status: 'In Progress', dueDate: '2025-02-10', assignee: 'Charlie' },
];

function App() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const newAccessToken = await refreshToken(); // Refresh Token을 이용한 Access Token 갱신 시도
      if (newAccessToken) {
        console.log("🟢 새 토큰 발급:", newAccessToken);
        document.cookie = `accessToken=${newAccessToken}; path=/;`; // 새 Access Token을 쿠키에 저장
      }
    }, 10 * 60 * 1000); // 10분마다 실행 (Access Token 갱신)

    return () => clearInterval(interval); // 컴포넌트가 언마운트될 때 interval 제거
  }, []);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/statistics" element={<StatisticsPage tasks={tasks} />} /> {/* tasks 전달 */}
          <Route path="/team-status" element={<TeamStatusPage />} /> {/* 팀 상태 페이지 추가 */}
          <Route path="/dashboard" element={<Dashboard />}  /> {/* 팀 상태 페이지 추가 */}
          <Route path="/chat" element={<Chatbox />} /> {/* ✅ 채팅 페이지 추가 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
