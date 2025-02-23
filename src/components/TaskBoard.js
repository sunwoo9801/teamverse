import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/TaskBoard.css";
import Chatbox from "../components/Chatbox";
import LeftSidebar from "../components/LeftSidebar"; // ✅ 왼쪽 사이드바 추가

const TaskBoard = () => {
    const location = useLocation();
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        console.log("📌 TaskBoard에서 프로젝트 목록 불러오기 시작...");
        
        if (location.state?.projects) {
            console.log("✅ location.state에서 프로젝트 불러옴:", location.state.projects);
            setProjects(location.state.projects);
        } else {
            console.warn("🚨 프로젝트 데이터 없음!");
        }
    }, [location]);

    return (
        <div className="task-board-container"> {/* 🔹 새로운 컨테이너 추가 */}
            <LeftSidebar /> {/* ✅ 왼쪽 사이드바 추가 */}

            <div className="task-board">
                <h2>📌 프로젝트 목록</h2>
                {projects.length > 0 ? (
                    <div className="task-board-grid">
                        {projects.map((project) => (
                            <div key={project.id} className="task-card">
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
        </div>
    );
};

export default TaskBoard;
