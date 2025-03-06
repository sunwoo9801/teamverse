import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/TaskBoard.css";


const TaskBoard = () => {
    const location = useLocation();
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        console.log("📌 TaskBoard에서 프로젝트 목록 불러오기 시작...");

        if (location.state?.projects) {
            console.log("✅ location.state에서 프로젝트 불러옴:", location.state.projects);
            setProjects(location.state.projects);
        } else {
            const storedProjects = localStorage.getItem("projects");
            console.log("🔍 로컬 스토리지에서 가져온 프로젝트:", storedProjects);

            if (storedProjects) {
                setProjects(JSON.parse(storedProjects)); // ✅ 로컬 스토리지에서 데이터 가져오기
            } else {
                console.warn("🚨 저장된 프로젝트 없음!");
            }
        }
    }, []);

    return (
        <div className="task-board">
            <h2>📌 프로젝트 목록</h2>
            {projects.length > 0 ? (
                <ul>
                    {projects.map((project) => (
                        <li key={project.id}>{project.name}</li>
                    ))}
                </ul>
            ) : (
                <p>🚨 프로젝트가 없습니다.</p>
            )}
        </div>
    );

};

export default TaskBoard;
