import React from "react";
import "../styles/ProjectNav.css"; // ✅ 스타일 파일 추가

const ProjectNav = ({ activeTab, setActiveTab }) => {
    return (
        <div className="project-nav">
            <button className={activeTab === "feed" ? "active" : ""} onClick={() => setActiveTab("feed")}>
                🏠 피드
            </button>
            <button className={activeTab === "tasks" ? "active" : ""} onClick={() => setActiveTab("tasks")}>
                ✅ 업무
            </button>
            <button className={activeTab === "gantt" ? "active" : ""} onClick={() => setActiveTab("gantt")}>
                📊 간트차트
            </button>
            <button className={activeTab === "files" ? "active" : ""} onClick={() => setActiveTab("files")}>
                📁 파일
            </button>
            <button className={activeTab === "memo" ? "active" : ""} onClick={() => setActiveTab("memo")}>
                📝 메모
            </button>
        </div>
    );
};

export default ProjectNav;
