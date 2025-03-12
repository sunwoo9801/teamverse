import React, { useState, useEffect } from "react";
import "../styles/LeftSidebar.css";
import logo from "../assets/images/image.png";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import Chatbox from "../components/Chatbox"; // Chatbox 컴포넌트 import
import { useNavigate, useLocation } from "react-router-dom"; // ✅ useLocation 추가


const LeftSidebar = ({ onCreateProject, onShowProjectList, projectId  }) => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const location = useLocation(); // ✅ 현재 경로 확인


    // 현재 로그인한 사용자 ID 불러오기
    useEffect(() => {
        const fetchUserId = async () => {
            const token = getAccessToken();
            if (!token) return;

            try {
                const response = await axios.get("http://localhost:8082/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });
                setUserId(response.data.id); // 사용자 ID 저장
            } catch (error) {
                console.error("❌ 사용자 정보 가져오기 실패:", error);
            }
        };

        fetchUserId();
    }, []);

    // "대시보드" 버튼 클릭 시 `/dashboard/{userId}`로 이동
    const handleDashboardClick = () => {
        if (userId) {
            navigate(`/dashboard/${userId}`);
        } else {
            console.error("🚨 사용자 ID를 찾을 수 없습니다!");
        }
    };

    return (
        <div className="left-sidebar">
            <div className="logo-container">
                <img src={logo} alt="Flow Team Logo" className="logo" />
            </div>

            {/* 새 프로젝트 추가 버튼 */}
            <button className="new-project-btn" onClick={onCreateProject}>
                <i className="far fa-folder-open"></i> 새 프로젝트 추가
            </button>

            <nav className="nav-menu">
                <ul>
                    <li onClick={handleDashboardClick}> {/* 클릭하면 사용자 대시보드 이동 */}
                        <i className="fas fa-home"></i> 대시보드
                    </li>
                    <li onClick={onShowProjectList}>
                        <i className="fas fa-folder"></i> 내 프로젝트
                    </li>
                </ul>
            </nav>
            {/* ✅ TaskBoard 페이지에서는 Chatbox 숨기기 */}
            {/* ✅ Chatbox의 가로 크기를 유지하면서 숨김 */}
            <div 
                className={`chatbox-wrapper ${location.pathname === "/TaskBoard" ? "hidden-chatbox" : ""}`}
            >
                <Chatbox projectId={projectId} />
            </div>
        </div>
    );
};

export default LeftSidebar;
