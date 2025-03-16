import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import TaskModal from "../components/TaskModal";
import TaskDetailModal from "../components/TaskDetailModal";
import GanttChart from "../components/GanttChart";
import { getStompClient } from "../api/websocket";
import "../styles/TaskPage.css";
import LeftSidebar from "../components/LeftSidebar"; // ✅ 사이드바 추가
import Statistics from "../components/Statistics"; // ✅ 추가
  
const TaskPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("projectId");

  const [project, setProject] = useState(null); // 프로젝트 정보 상태 
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null); // 수정할 Task 저장
  const [selectedTask, setSelectedTask] = useState(null); // Task 상세 보기용 상태
  const user = JSON.parse(localStorage.getItem("user")); // ✅ 변경


  // 프로젝트 정보 불러오기
  const fetchProject = async () => {
    if (!projectId) return;

    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8082/api/user/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      setProject(response.data); // 프로젝트 상태 업데이트
    } catch (error) {
      console.error("❌ 프로젝트 정보 불러오기 실패:", error);
    }
  };

  // Task 목록 불러오기
  const fetchTasks = async () => {
    if (!projectId) return;

    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8082/api/user/tasks?projectId=${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      // ✅ createdBy가 포함되었는지 확인
      if (!response.data.some(task => task.hasOwnProperty("createdBy"))) {
        console.error("🚨 Task 데이터에 createdBy 값이 없음! 백엔드 확인 필요");
      } else {
        console.log("✅ createdBy 포함됨!");
      }

      // formattedTasks 변환 (tasks 배열을 가공)
      const formattedTasks = response.data.map((task) => ({
        id: task.id,
        name: task.name,
        start: task.startDate ? new Date(task.startDate + "T00:00:00") : null, // 날짜 변환
        end: task.dueDate ? new Date(task.dueDate + "T23:59:59") : null, // 마감일 변환
        color: task.color || "#ff99a5",
        createdBy: task.createdBy, // ✅ createdBy 필드 추가
      }));
      setTasks(response.data);

    } catch (error) {
      console.error("❌ Task 목록 불러오기 실패:", error);
    }
  };

  // Task 추가 후 목록 갱신
  const refreshTasks = () => {
    fetchTasks();
  };

  // Task 삭제 함수 수정
  const handleDeleteTask = async (taskId) => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!window.confirm("정말로 이 업무를 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`http://localhost:8082/api/user/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      alert("업무가 성공적으로 삭제되었습니다.");
      refreshTasks(); // 목록 새로고침
    } catch (error) {
      console.error("❌ Task 삭제 실패:", error);
      alert("업무 삭제에 실패했습니다.");
    }
  };
  // useEffect에 WebSocket 삭제 이벤트 추가
  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchTasks();

      const stompClient = getStompClient();
      if (stompClient.connected) {
        stompClient.subscribe(`/topic/tasks/delete`, (message) => {
          const deletedTaskId = JSON.parse(message.body);
          setTasks((prevTasks) => prevTasks.filter((task) => task.id !== deletedTaskId));
        });
      }
    }
  }, [projectId]);

  

  return (
    <div className="task-page">
      {/* ✅ 사이드바 추가 */}
      <div className="sidebar-container">
        <LeftSidebar projectId={projectId} />
      </div>
      {/* ✅ 기존 TaskPage 내용 감싸기 */}
      <div className="task-content">
      {/* 프로젝트 제목 */}
      <h2 className="project-title">{project ? project.name : "로딩 중..."}</h2>
      
      <button className="add-task-btn" onClick={() => { setEditTask(null); setIsModalOpen(true); }}>
            + 업무 추가
          </button>
      <hr className="title-divider" />
      

      <div className="task-container">
        {/* 왼쪽: Task 목록 */}
        <div className="task-list">
          

          <table className="task-table">
            <thead>
              <tr>
                <th>업무명</th>
                <th>상태</th>
                <th>시작일</th>
                <th>마감일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.name}</td>
                  <td><span className={`status-badge ${task.status}`}>{task.status}</span></td>
                  <td>{task.startDate}</td>
                  <td>{task.dueDate}</td>
                  <td className="task-actions">
                    {Number(task.createdBy) === Number(user?.id) && (
                      <>
                        <button className="edit-btn" onClick={() => { setEditTask(task); setIsModalOpen(true); }}>수정</button>
                        <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>삭제</button>
                      </>
                    )}
                    <button className="detail-btn" onClick={() => setSelectedTask(task)}>상세 보기</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 오른쪽: 간트 차트 */}
        <div className="gantt-chart-container">
          <GanttChart tasks={tasks} />
        </div>
      </div>

      {/* Task 추가 & 수정 모달 */}
      {isModalOpen && (
        <TaskModal
          onClose={() => setIsModalOpen(false)}
          projectId={projectId}
          refreshTasks={fetchTasks}
          editTask={editTask}
        />
      )}

      {/* Task 상세 보기 모달 */}
      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
    </div>
  );
};

export default TaskPage;