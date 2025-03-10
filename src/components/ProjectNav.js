import React from "react";
import { FaHome, FaTasks, FaChartBar, FaFolderOpen, FaStickyNote } from "react-icons/fa"; // react-icons 사용
import "../styles/ProjectNav.css"; // 스타일 파일 추가

const ProjectNav = ({ activeTab, setActiveTab }) => {
    return (
        <div className="project-nav">
            <button className={activeTab === "feed" ? "active" : ""} onClick={() => setActiveTab("feed")}>
                <FaHome /> 피드
            </button>
            <button className={activeTab === "tasks" ? "active" : ""} onClick={() => setActiveTab("tasks")}>
                <FaTasks /> 업무
            </button>
            <button className={activeTab === "gantt" ? "active" : ""} onClick={() => setActiveTab("gantt")}>
                <FaChartBar /> 간트차트
            </button>
            <button className={activeTab === "files" ? "active" : ""} onClick={() => setActiveTab("files")}>
                <FaFolderOpen /> 파일
            </button>

        </div>
    );
};

export default ProjectNav;
