import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; // 🔹 API 요청을 위해 추가
import "../styles/TaskBoard.css";
import LeftSidebar from "../components/LeftSidebar";

import { getAccessToken } from "../utils/authUtils"; // 🔹 토큰 가져오는 유틸 추가

const TaskBoard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");

    useEffect(() => {
        console.log("📌 TaskBoard에서 프로젝트 목록 불러오기 시작...");

        if (location.state?.projects) {
            console.log("✅ location.state에서 프로젝트 불러옴:", location.state.projects);
            setProjects(location.state.projects);
        } else {
            console.warn("🚨 프로젝트 데이터 없음!");
        }
        
    }, [location]);

    
    // 🔹 새로운 프로젝트 생성 함수 추가
    const handleCreateProject = async () => {
        const token = getAccessToken();
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        try {
            const newProjectData = {
                name: projectName.trim() || "새 프로젝트",
                description: projectDescription.trim() || "",
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

            console.log("✅ 새 프로젝트 생성 완료:", response.data);

            // 🔹 프로젝트 목록에 추가
            setProjects((prevProjects) => [...prevProjects, response.data]);

            // 🔹 모달 닫기
            setShowModal(false);

            // 🔹 Task 페이지로 이동
            navigate(`/task?projectId=${response.data.id}`);

        } catch (error) {
            console.error("❌ 프로젝트 생성 실패:", error);
            alert("프로젝트 생성에 실패했습니다.");
        }
    };

    const handleProjectClick = (projectId) => {
        navigate(`/project/${projectId}`);
    };

    return (
        <div className="task-board-container">
            <div className="sidebar-container">
                <LeftSidebar onCreateProject={() => setShowModal(true)} />
            </div>
            <div className="task-board">
                <h2>최근 프로젝트</h2>
                {projects.length > 0 ? (
                    <div className="task-board-grid">
                        {projects.map((project) => (
                            <div key={project.id} className="task-card"
                                onClick={() => handleProjectClick(project.id)}
                            >
                                <h3>{project.name}</h3>
                                <p>{project.description || "설명이 없습니다."}</p>
                                <p className="project-date">📅 시작일: {project.startDate}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>🚨 프로젝트가 없습니다.</p>
                )}
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
                        <button onClick={handleCreateProject}>생성</button> {/* 🔹 생성 함수 연결 */}
                        <button onClick={() => setShowModal(false)}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskBoard;
