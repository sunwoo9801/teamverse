import React from "react";
import "../styles/LeftSidebar.css";
import logo from "../assets/images/logo.png"; // ✅ 기본 프로필 이미지 추가
import { useNavigate } from "react-router-dom";


const LeftSidebar = ({ onCreateProject}) => {
    const navigate = useNavigate(); // ✅ useNavigate 추가

    const handleNavMenuClick = () => {
        navigate("/TaskBoard"); // ✅ TaskBoard 페이지로 이동
    };

    return (
        <div className="left-sidebar">
            <div className="logo-container">
                <img src={logo} alt="Flow Team Logo" className="logo" />
            </div>

            {/* ✅ 버튼 클릭 시 onCreateProject 함수 실행 */}
            <button className="new-project-btn" onClick={onCreateProject}>
                <i className="far fa-folder-open"></i> 새 프로젝트 추가
            </button>

            <nav className="nav-menu">
                <ul>
                    <li><i className="fas fa-home"></i> 대시보드</li>
                    <li onClick={handleNavMenuClick}> {/* ✅ 클릭 이벤트 추가 */}
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
