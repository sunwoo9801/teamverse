

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import GanttChart from "../components/GanttChart";
import Chatbox from "../components/Chatbox";
import Dashboard from "../components/Dashboard";
import TaskBoard from "../components/TaskBoard";
import "../styles/MainPage.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { getAccessToken } from "../utils/authUtils";
import InviteList from "../components/InviteList"; // ✅ 초대 목록 컴포넌트 추가
import { getStompClient } from "../api/websocket"; // ✅ getStompClient 사용



const MainPage = () => {
    const [projects, setProjects] = useState([]); // ✅ 프로젝트 목록 저장
    const [selectedProject, setSelectedProject] = useState(null); // ✅ 선택한 프로젝트 저장
    const [tasks, setTasks] = useState([]); // ✅ 선택한 프로젝트의 작업 목록
    const [showModal, setShowModal] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [user, setUser] = useState(null);
    const { userId } = useParams();
    const navigate = useNavigate(); // ✅ 페이지 이동
    const [projectDescription, setProjectDescription] = useState(""); // ✅ 설명 추가
    const [invites, setInvites] = useState([]); // ✅ 초대 목록 상태 추가

    // ✅ 로그인한 사용자의 프로젝트 목록 불러오기
    const fetchProjects = async () => {
        const token = getAccessToken();
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        try {
            const response = await axios.get("http://localhost:8082/api/user/projects", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            console.log("✅ 서버에서 가져온 프로젝트 목록:", response.data);
            if (response.data && response.data.length > 0) {
                const uniqueProjects = response.data.reduce((acc, project) => {
                    if (!acc.some((p) => p.id === project.id)) {
                        acc.push(project);
                    }
                    return acc;
                }, []);

                setProjects(uniqueProjects);
                setSelectedProject(uniqueProjects[0]);
                fetchTasks(uniqueProjects[0].id);
            }
        } catch (error) {
            console.error("❌ 프로젝트 목록 불러오기 실패:", error);
        }
    };




    // 새로운 Access Token 발급
    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            navigate("/login");
            return;
        }

        try {
            const response = await axios.post("http://localhost:8082/api/auth/refresh", {
                refreshToken,
            });

            localStorage.setItem("accessToken", response.data.accessToken);
            sessionStorage.setItem("accessToken", response.data.accessToken); // ✅ 추가: sessionStorage에도 저장
            console.log("✅ 새 Access Token 발급:", response.data.accessToken);
            return response.data.accessToken;
        } catch (error) {
            console.error("🚨 토큰 갱신 실패, 다시 로그인 필요:", error);
            navigate("/login");
        }
    };

    // ✅ 새로운 프로젝트 생성
    const handleCreateProject = async () => {
        const token = getAccessToken(); // sessionStorage에서도 accessToken을 가져올 수 있도록 변경

        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        try {
            // 사용자가 입력한 값 반영 (빈 값이면 null 처리)
            const newProjectData = {
                name: projectName.trim() !== "" ? projectName.trim() : null,
                description: projectDescription.trim() !== "" ? projectDescription.trim() : null,
                startDate: new Date().toISOString().split("T")[0],
            };

            const response = await axios.post(
                "http://localhost:8082/api/user/projects", newProjectData, {
                // { name: projectName, startDate: new Date().toISOString().split("T")[0] },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            console.log("✅ 새 프로젝트 생성 응답:", response.data);
            // ✅ 프로젝트 생성 후 Task 페이지로 이동
            navigate(`/task?projectId=${response.data.id}`);


            // setProjects([...projects, response.data]);
            // setSelectedProject(response.data);
            // localStorage.setItem("selectedProjectId", response.data.id);
            // setShowModal(false);
            // ✅ 프로젝트 목록에 즉시 추가 (name이 올바르게 존재하는지 확인)
            if (!response.data || !response.data.id) {
                throw new Error("프로젝트 생성 후 ID를 찾을 수 없습니다.");
            }

            setProjects((prevProjects) => [...prevProjects, response.data]);
            setSelectedProject(response.data);
            localStorage.setItem("selectedProjectId", response.data.id);
            fetchTasks(response.data.id);
            setShowModal(false);
        } catch (error) {
            console.error("❌ 프로젝트 생성 실패:", error);
            alert("프로젝트 생성에 실패했습니다.");
        }
    };

    // ✅ 선택한 프로젝트의 작업(Task) 목록 불러오기
    const fetchTasks = async (projectId) => {
        const token = getAccessToken();
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
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

            console.log(`✅ 프로젝트 ${projectId}의 작업 목록:`, response.data);
            setTasks(response.data);
        } catch (error) {
            console.error(`❌ 프로젝트 ${projectId}의 작업 목록 불러오기 실패:`, error);
        }
    };
    // ✅ 프로젝트 선택 시 처리 함수
    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        fetchTasks(project.id);
        console.log("🔍 선택된 프로젝트:", project);
    };

       // ✅ 프로젝트 상세 보기 페이지(TaskPage)로 이동
       const handleProjectClick = (projectId) => {
        navigate(`/task?projectId=${projectId}`);
    };

    const fetchInvites = async () => {
        const token = getAccessToken();
        try {
          const response = await axios.get("http://localhost:8082/api/team/invites", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("📌 받은 초대 목록:", response.data);
          setInvites(response.data);
        } catch (error) {
          console.error("❌ 초대 목록 불러오기 실패:", error);
        }
      };

      useEffect(() => {
        fetchProjects(); // ✅ 로그인 시 프로젝트 목록 조회
        fetchInvites(); // ✅ 로그인 시 초대 목록 조회

        const stompClient = getStompClient(); // ✅ WebSocket 가져오기

        if (!stompClient.connected) { // ✅ 기존 연결이 없을 때만 활성화
            console.log("🟢 WebSocket 활성화 시도...");
            stompClient.activate();
        }

        const onWebSocketConnect = () => {
            console.log("✅ WebSocket 연결 성공 & 구독 시작");
            stompClient.subscribe("/topic/projects", (message) => {
                console.log("📩 새 프로젝트 업데이트 수신:", message.body);
                fetchProjects();
            });
        };

        // ✅ 중복 등록 방지: 이미 등록된 경우 새로 추가하지 않음
        if (!stompClient.onConnect) {
            stompClient.onConnect = onWebSocketConnect;
        }

        return () => {
            console.log("🛑 WebSocket 해제");
            if (stompClient && stompClient.connected) {
                stompClient.deactivate();
            }
        };
    }, []);

    useEffect(() => {
        if (selectedProject) {
            console.log("🔄 선택된 프로젝트 변경됨:", selectedProject.id);
        }
    }, [selectedProject]);


    return (
        <div className="main-page">
            <div className="content">

                {/* ✅ 프로젝트 목록 표시 */}
                <div className="project-list">
                    <h2>📂 프로젝트 목록</h2>
                    {projects.length === 0 ? (
                        <p>현재 프로젝트가 없습니다.</p>
                    ) : (
                        <ul className="project-list-container">
                            {projects.map((project) => (
                                <li key={project.id}>
                                    <button
                                        className={`project-btn ${selectedProject?.id === project.id ? "active" : ""}`}
                                        onClick={() =>
                                            handleProjectSelect(project)
                                            // {setSelectedProject(project);
                                            // localStorage.setItem("selectedProjectId", project.id)}
                                        }
                                    >
                                        {/* 수정: 프로젝트 이름이 없을 경우 대비 */}
                                        {project?.name || "🚨 이름 없음"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button className="create-project-btn" onClick={() => setShowModal(true)}>
                        새로운 프로젝트 생성
                    </button>
                </div>

                {/* ✅ 선택한 프로젝트의 간트 차트 표시 */}
                {selectedProject ? (
                    <div className="project-details">
                         {/* ✅ 클릭 시 TaskPage로 이동 */}
                         <h2
                            className="clickable-title"
                            onClick={() => handleProjectClick(selectedProject.id)}
                            style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }} // ✅ 스타일 추가
                        >
                            📊 {selectedProject.name} - 간트차트
                        </h2>
                        <GanttChart project={selectedProject} tasks={tasks} />
                    </div>
                ) : (
                    <p className="no-project-selected">📌 프로젝트를 선택해주세요.</p>
                )}

                <TaskBoard />
                <Dashboard tasks={[]} />
            </div>
            <div className="chatbox-container">
            <Sidebar projectId={selectedProject?.id} />
            <Chatbox projectId={selectedProject ? selectedProject.id : null} />
                <InviteList refreshProjects={fetchProjects} />

            </div>

    {/* 🔹 프로젝트 생성 모달 */}
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

export default MainPage;
