import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import TaskModal from "../components/TaskModal";
import TaskDetailModal from "../components/TaskDetailModal"; // Task 상세 보기 모달
import GanttChart from "../components/GanttChart"; // 간트 차트 임포트
import "../styles/TaskPage.css"; //새로운 CSS 스타일 적용

const TaskPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("projectId");

  const [project, setProject] = useState(null); // ✅ 프로젝트 정보 상태 
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null); // 수정할 Task 저장
  const [selectedTask, setSelectedTask] = useState(null); // Task 상세 보기용 상태

  // ✅ 프로젝트 정보 불러오기
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

      setProject(response.data); // ✅ 프로젝트 상태 업데이트
    } catch (error) {
      console.error("❌ 프로젝트 정보 불러오기 실패:", error);
    }
  };

  // ✅ Task 목록 불러오기
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

      setTasks(response.data);
    } catch (error) {
      console.error("❌ Task 목록 불러오기 실패:", error);
    }
  };

  // ✅ Task 추가 후 목록 갱신
  const refreshTasks = () => {
    fetchTasks();
  };

  // ✅ Task 삭제 함수 
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
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      alert("업무가 성공적으로 삭제되었습니다.");
      refreshTasks(); // ✅ 삭제 후 목록 새로고침
    } catch (error) {
      console.error("❌ Task 삭제 실패:", error);
      alert("업무 삭제에 실패했습니다.");
    }
  };

  // ✅ 프로젝트 및 Task 목록 불러오기
  useEffect(() => {
    if (projectId) {
      fetchProject(); // ✅ 프로젝트 정보 가져오기
      fetchTasks(); // ✅ Task 목록 가져오기
    }
  }, [projectId]);

//   return (
//     <div className="task-page">
//       <h1>{project ? project.name : "로딩 중..."}</h1> {/* ✅ 프로젝트 이름 표시 */}
//       <button onClick={() => { setEditTask(null); setIsModalOpen(true); }}>+ 업무 추가</button>

//       {/* ✅ Task 목록 표시 */}
//       <ul>
//         {tasks.map((task) => (
//           <li key={task.id}>
//             <strong>{task.name}</strong> - {task.status}
//             <br /> 🗓 **시작일**: {task.startDate} | ⏳ **마감일**: {task.dueDate}
//             <button onClick={() => { setEditTask(task); setIsModalOpen(true); }}>수정</button> 
//             <button onClick={() => setSelectedTask(task)} style={{ marginLeft: "10px", color: "blue" }}>상세 보기</button>
//             <button onClick={() => handleDeleteTask(task.id)} style={{ marginLeft: "10px", color: "red" }}>삭제</button> 
//           </li>
//         ))}
//       </ul>

//       {/* ✅ Task 추가 & 수정 모달 */}
//       {isModalOpen && (
//         <TaskModal
//           onClose={() => setIsModalOpen(false)}
//           projectId={projectId}
//           refreshTasks={refreshTasks}
//           editTask={editTask} // ✅ 수정할 Task 전달
//         />
//       )}

//       {/* ✅ Task 상세 보기 모달 */}
//       {selectedTask && (
//         <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
//       )}
//     </div>
//   );
// };
return (
  <div className="task-page"> {/* ✅ 수정: 전체 페이지 스타일 적용 */}
    {/* ✅ 프로젝트 이름 + 구분선 */}
    <h2 className="project-title">{project ? project.name : "로딩 중..."}</h2>
    <hr className="title-divider" />

    <div className="task-container"> {/* ✅ 수정: 업무 목록과 간트 차트를 나란히 배치 */}
      {/* ✅ 왼쪽: 업무 목록 */}
      <div className="task-list">
        <button onClick={() => { setEditTask(null); setIsModalOpen(true); }}>
          + 업무 추가
        </button>
        <table>
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
                <td>
                  <span className={`status-badge ${task.status}`}>
                    {task.status}
                  </span>
                </td>
                <td>{task.startDate}</td>
                <td>{task.dueDate}</td>
                <td>
                  <button onClick={() => { setEditTask(task); setIsModalOpen(true); }}>
                    수정
                  </button>
                  <button onClick={() => setSelectedTask(task)} className="detail-btn">
                    상세 보기
                  </button>
                  <button onClick={() => handleDeleteTask(task.id)} className="delete-btn">
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ 오른쪽: 간트 차트 */}
      <div className="gantt-chart-container">
        <GanttChart tasks={tasks} />
      </div>
    </div>

    {/* ✅ Task 추가 & 수정 모달 */}
    {isModalOpen && (
      <TaskModal
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        refreshTasks={fetchTasks}
        editTask={editTask}
      />
    )}

    {/* ✅ Task 상세 보기 모달 */}
    {selectedTask && (
      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
    )}
  </div>
);
};

export default TaskPage;
