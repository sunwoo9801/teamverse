import React, { useState, useEffect } from "react";
import "../styles/LeftSidebar.css";
import logo from "../assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";

const LeftSidebar = ({ onCreateProject, onShowProjectList }) => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);

    // ✅ 현재 로그인한 사용자 ID 불러오기
    useEffect(() => {
        const fetchUserId = async () => {
            const token = getAccessToken();
            if (!token) return;

            try {
                const response = await axios.get("http://localhost:8082/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });
                setUserId(response.data.id); // ✅ 사용자 ID 저장
            } catch (error) {
                console.error("❌ 사용자 정보 가져오기 실패:", error);
            }
        };

        fetchUserId();
    }, []);

    // ✅ "대시보드" 버튼 클릭 시 `/dashboard/{userId}`로 이동
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

            {/* ✅ 새 프로젝트 추가 버튼 */}
            <button className="new-project-btn" onClick={onCreateProject}>
                <i className="far fa-folder-open"></i> 새 프로젝트 추가
            </button>

            <nav className="nav-menu">
                <ul>
                    <li onClick={handleDashboardClick}> {/* ✅ 클릭하면 사용자 대시보드 이동 */}
                        <i className="fas fa-home"></i> 대시보드
                    </li>
                    <li onClick={onShowProjectList}>
                        <i className="fas fa-folder"></i> 내 프로젝트
                    </li>
                    <li><i className="fas fa-search"></i> 회사 공개 프로젝트</li>
                    <li><i className="fas fa-ellipsis-h"></i> 더보기</li>
                </ul>
            </nav>

            <div className="section">
                <p>모아보기</p>
            </div>
            <div className="section">
                <p>최근 업데이트</p>
            </div>
        </div>
    );
};

export default LeftSidebar;
