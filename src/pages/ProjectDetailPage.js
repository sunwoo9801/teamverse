import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import TaskModal from "../components/TaskModal"; //  작업 추가 모달
import TaskDetailModal from "../components/TaskDetailModal"; // ✅ Task 상세보기 모달 추가
import GanttChart from "../components/GanttChart"; //  간트 차트 임포트
import ProjectNav from "../components/ProjectNav"; // 프로젝트 내부 네비게이션 추가
import PostTodoModal from "../components/PostTodoModal";
import ActivityFeed from "../components/ActivityFeed"; // ✅ 피드 컴포넌트 추가
import FilesTab from "../components/FilesTab";
import LeftSidebar from "../components/LeftSidebar"; // ✅ LeftSidebar 추가
import Toolbar from "../components/Toolbar";

import "../styles/ProjectDetailPage.css";

const ProjectDetailPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]); //  프로젝트의 작업 목록 상태
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false); //  작업 추가 모달 상태
    const [editTask, setEditTask] = useState(null); // 수정할 Task 상태
    const [activeTab, setActiveTab] = useState("feed"); // 현재 선택된 탭 (피드 기본값)
    const [isPostTodoModalOpen, setIsPostTodoModalOpen] = useState(false); // ✅ 글/할 일 모달 상태
    const [feed, setFeed] = useState([]);
    const [postTodoModalTab, setPostTodoModalTab] = useState("post"); // ✅ 기본값을 "post"로 설정
    
    const [showModal, setShowModal] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");

    // ✅ 프로젝트 리스트 보기 핸들러
    const handleShowProjectList = () => {
        navigate("/TaskBoard", { state: { projectId } });
    };

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

            setProject(response.data);
        } catch (error) {
            console.error("❌ 프로젝트 정보 불러오기 실패:", error);

            if (error.response && error.response.status === 403) {
                alert("🚨 이 프로젝트에 속한 팀원만 접근할 수 있습니다.");
                navigate("/dashboard"); // 🚨 대시보드로 이동
            }
        }
    };

      // ✅ 새로운 프로젝트 생성 함수 추가
      const handleCreateProject = async () => {
        const token = getAccessToken();
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        try {
            const newProjectData = {
                name: projectName.trim() !== "" ? projectName.trim() : null,
                description: projectDescription.trim() !== "" ? projectDescription.trim() : null,
                startDate: new Date().toISOString().split("T")[0],
            };

            const response = await axios.post(
                "http://localhost:8082/api/user/projects", 
                newProjectData, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            console.log("✅ 새 프로젝트 생성 응답:", response.data);

            // ✅ 프로젝트 생성 후 Task 페이지로 이동
            navigate(`/task?projectId=${response.data.id}`);

            // ✅ 상태 초기화
            setProjectName("");
            setProjectDescription("");
            setShowModal(false);
        } catch (error) {
            console.error("❌ 프로젝트 생성 실패:", error);
            alert("프로젝트 생성에 실패했습니다.");
        }
    };


    // ✅ 피드 목록 불러오기
    const fetchFeed = async () => {
        if (!projectId) return;

        const token = getAccessToken();
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8082/api/activity/feed/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            console.log("📌 피드 데이터:", response.data);
            setFeed(response.data);
        } catch (error) {
            console.error("❌ 피드 불러오기 실패:", error);
        }
    };

    // ✅ 프로젝트의 업무 목록 불러오기
    const fetchTasks = async () => {
        if (!projectId) return;

        const token = getAccessToken();
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8082/api/user/projects/${projectId}/tasks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            console.log("📌 받아온 작업 목록:", response.data); // ✅ 디버깅용 콘솔 추가
            setTasks(response.data); // ✅ 상태 업데이트
        } catch (error) {
            console.error("❌ 작업 목록 불러오기 실패:", error);
        }
    };


    // ✅ 피드 갱신 함수
    const refreshFeed = () => {
        console.log("📌 피드 갱신 중...");
        fetchTasks();
        fetchFeed();
    };


    useEffect(() => {
        if (projectId) {
            fetchProject();
            fetchTasks();
            fetchFeed(); // ✅ 피드도 자동으로 가져오기
        }
    }, [projectId]);




    //  Task 삭제 기능
    const handleDeleteTask = async (taskId) => {
        const token = getAccessToken();
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!window.confirm("정말로 이 작업을 삭제하시겠습니까?")) return;

        try {
            await axios.delete(`http://localhost:8082/api/user/tasks/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            alert("✅ 작업이 삭제되었습니다.");
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        } catch (error) {
            console.error("❌ 작업 삭제 실패:", error);
        }
    };

    if (!project) {
        return <p>📌 프로젝트 정보를 불러오는 중...</p>;
    }

    //  작업 추가 후 목록 갱신
    const refreshTasks = () => {
        const fetchTasks = async () => {
            const token = getAccessToken();
            if (!token) {
                alert("로그인이 필요합니다.");
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8082/api/user/projects/${projectId}/tasks`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                });
                setTasks(response.data);
            } catch (error) {
                console.error("❌ 작업 목록 불러오기 실패:", error);
            }
        };

        fetchTasks();
    };

    if (!project) {
        return <p>📌 프로젝트 정보를 불러오는 중...</p>;
    }

    return (
        <div className="project-detail-page">
            <div className="project-layout">

                {/* ✅ 왼쪽 사이드바 추가 */}
                <LeftSidebar onCreateProject={() => setShowModal(true)} onShowProjectList={handleShowProjectList} />

                <div className="project-content">
                <div className="project-header">
                <div className="project-title-container">
                    <h1>{project?.name || "프로젝트 로딩 중..."}</h1>
                    <p className="project-description">
                        {project?.description || ""}
                    </p>
                </div>
                <div className="project-dates">
                    <p>📅 시작일: {project?.startDate}</p>
                    <p>⏳ 마감일: {project?.endDate || "미정"}</p>
                </div>
            </div>
                    {/* ✅ 내부 네비게이션 추가 */}
                    <ProjectNav activeTab={activeTab} setActiveTab={setActiveTab} />

                    {/* {activeTab === "feed" && (
                        <div className="post-nav">
                            <button onClick={() => { setPostTodoModalTab("post"); setIsPostTodoModalOpen(true); }}>
                                📝 글
                            </button>
                            <button onClick={() => { setPostTodoModalTab("task"); setIsPostTodoModalOpen(true); }}>
                                📋 업무
                            </button>
                            <button onClick={() => { setPostTodoModalTab("todo"); setIsPostTodoModalOpen(true); }}>
                                📅 할 일
                            </button>
                        </div>
                    )} */}
                    <div className="p-4">
                        <Toolbar
                            onPostClick={() => { 
                            setPostTodoModalTab("post"); 
                            setIsPostTodoModalOpen(true); 
                            }}
                            onTaskClick={() => { 
                            setPostTodoModalTab("task"); 
                            setIsPostTodoModalOpen(true); 
                            }}
                            onCalendarClick={() => { 
                            setPostTodoModalTab("calendar");
                            setIsPostTodoModalOpen(true);
                            }}
                            onTodoClick={() => { 
                            setPostTodoModalTab("todo"); 
                            setIsPostTodoModalOpen(true); 
                            }}
                        />
                        </div>

                    {isPostTodoModalOpen && (
                        <PostTodoModal
                            onClose={() => setIsPostTodoModalOpen(false)}
                            initialTab={postTodoModalTab}
                            refreshFeed={refreshFeed}
                            projectId={projectId}
                        />
                    )}

                    {activeTab === "feed" && (
                        <div className="feed-section">
                            <button onClick={() => setIsPostTodoModalOpen(true)}>📝 글 작성</button>
                            <ActivityFeed projectId={projectId} />
                        </div>
                    )}

                    {/* ✅ 작업 목록 */}
                    {activeTab === "tasks" && (
                        <div className="task-section">
                            <h2>📝 작업 목록</h2>
                            <table className="task-table">
                                <thead>
                                    <tr>
                                        <th>작업명</th>
                                        <th>담당자</th>
                                        <th>상태</th>
                                        <th>시작일</th>
                                        <th>마감일</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map((task) => (
                                        <tr key={task.id}>
                                            <td>{task.name}</td>
                                            <td>{task.assignedTo?.username || "미정"}</td>
                                            <td>{task.status}</td>
                                            <td>{task.startDate}</td>
                                            <td>{task.dueDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ✅ Gantt Chart 탭 */}
                    {activeTab === "gantt" && (
                        <div className="task-page">
                            <h2 className="project-title">{project?.name || "로딩 중..."}</h2>
                            <hr className="title-divider" />
                            <div className="task-container">
                                <div className="task-list">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>업무명</th>
                                                <th>상태</th>
                                                <th>시작일</th>
                                                <th>마감일</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.map((task) => (
                                                <tr key={task.id}>
                                                    <td>{task.name}</td>
                                                    <td>{task.status}</td>
                                                    <td>{task.startDate}</td>
                                                    <td>{task.dueDate}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="gantt-chart-container">
                                    <GanttChart tasks={tasks} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* {activeTab === "files" && <FilesTab projectId={projectId} />} */}
                    {activeTab === "files" && (
                        <div className="files-section">
                            <FilesTab projectId={projectId} />
                        </div>
                    )}


                </div>


                {/* ✅ 🚀 **우측 사이드바 추가** */}
                <div className="sidebar-container">
                    <Sidebar projectId={projectId} />
                </div>
            </div>

            {/* ✅ Task 추가 & 수정 모달 (업무 추가) */}
            {isTaskModalOpen && (
                <TaskModal
                    onClose={() => setIsTaskModalOpen(false)}
                    projectId={projectId}
                    refreshTasks={() => setTasks([...tasks])}
                    editTask={editTask}
                />
            )}


  {/* ✅ 프로젝트 생성 모달 추가 */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>새 프로젝트 생성</h2>
                        <input
                            type="text"
                            placeholder="프로젝트 이름"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                        />
                        <input 
                            type="text" 
                            placeholder="프로젝트 설명 (선택 사항)" 
                            value={projectDescription} 
                            onChange={(e) => setProjectDescription(e.target.value)}
                        />
                        <button onClick={handleCreateProject}>생성</button>
                        <button onClick={() => setShowModal(false)}>취소</button>
                    </div>
                </div>
            )}
            
        </div>
    );

};

export default ProjectDetailPage;
