import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import GanttChart from "../components/GanttChart";
import Chatbox from "../components/Chatbox";
import Dashboard from "../components/Dashboard";
import TaskBoard from "../components/TaskBoard";
import "../styles/MainPage.css";
import axios from "axios";

const MainPage = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [user, setUser] = useState(null);

    // 🔹 로그인한 유저 정보 가져오기
    const fetchUserInfo = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await axios.get("http://localhost:8082/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("✅ 로그인한 사용자 정보:", response.data);
            setUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data));
        } catch (error) {
            console.error("❌ 사용자 정보 불러오기 실패:", error);
        }
    };

    // 🔹 로그인한 유저의 프로젝트 불러오기
    const fetchProjects = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await axios.get("http://localhost:8082/api/user/projects", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("✅ 로그인한 유저의 프로젝트 목록:", response.data);
            setProjects(response.data);

            const savedProjectId = localStorage.getItem("selectedProjectId");
            if (savedProjectId) {
                const foundProject = response.data.find(proj => proj.id === parseInt(savedProjectId));
                if (foundProject) {
                    setSelectedProject(foundProject);
                }
            }
        } catch (error) {
            console.error("❌ 프로젝트 목록 불러오기 실패:", error);
        }
    };

    // ✅ 처음 렌더링될 때 유저 정보 및 프로젝트 가져오기
    useEffect(() => {
        fetchUserInfo();
        fetchProjects();
    }, []);

    const handleCreateProject = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:8082/api/user/projects",
                { name: projectName, startDate: new Date().toISOString().split("T")[0] },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("✅ 프로젝트 생성 성공:", response.data);
            setProjects([...projects, response.data]);
            setSelectedProject(response.data);
            localStorage.setItem("selectedProjectId", response.data.id);
            setShowModal(false);
        } catch (error) {
            console.error("❌ 프로젝트 생성 실패:", error);
            alert("프로젝트 생성에 실패했습니다.");
        }
    };

    return (
        <div className="main-page">
            <div className="content">
            {projects.length === 0 ? (
                    <div className="empty-gantt">
                        <p>현재 프로젝트가 없습니다.</p>
                        <button className="create-project-btn" onClick={() => setShowModal(true)}>
                            새로운 프로젝트 생성
                        </button>
                    </div>
                ) : (
                    <GanttChart project={projects[0]} />
                )}
                <TaskBoard />
                <Dashboard tasks={[]} />
            </div>
            <div className="chatbox-container">
                <Sidebar />
                <Chatbox />
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
                        <button onClick={handleCreateProject}>생성</button>
                        <button onClick={() => setShowModal(false)}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainPage;
