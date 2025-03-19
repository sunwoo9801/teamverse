import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import Statistics from "../components/Statistics";
import LeftSidebar from "../components/LeftSidebar";
import "../styles/StatisticsPage.css";

const StatisticsPage = () => {
  const [tasks, setTasks] = useState([]);
  const [projectId, setProjectId] = useState(localStorage.getItem("projectId") || null);
  const token = getAccessToken();

  useEffect(() => {
    if (!projectId) {
      console.error("❌ 프로젝트 ID 없음, 다시 로드 필요");
      return;
    }

    const fetchTasks = async () => {
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      try {
        const response = await axios.get(`https://teamverse.onrender.com/api/user/tasks?projectId=${projectId}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          withCredentials: true,
        });

        setTasks(response.data);
      } catch (error) {
        console.error("❌ 업무 목록 불러오기 실패:", error);
        if (error.response && error.response.status === 401) {
          alert("인증이 만료되었습니다. 다시 로그인해주세요.");
          window.location.href = "/login"; // 🚨 로그인 페이지로 이동
        }
      }
    };

    fetchTasks();
  }, [token, projectId]); // ✅ `projectId`가 변경될 때마다 실행

  return (
    <div className="statistics-page">
      <div className="sidebar-container">
        <LeftSidebar projectId={projectId} /> {/* ✅ 프로젝트 ID 전달 */}
      </div>
      <div className="statistics-content">
        <h2 className="statistics-title">📊 프로젝트 통계</h2>
        <div className="stats-card-container">
          <Statistics tasks={tasks} />
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
