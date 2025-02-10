import React from "react";
import { Link } from "react-router-dom";
import { logoutUser } from "../api/authApi"; // ✅ 로그아웃 함수 추가
import "../styles/Navbar.css";

const Navbar = () => {
  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/login"; // ✅ 로그아웃 후 로그인 페이지로 이동
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">TeamVerse</div>
      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/statistics">Statistics</Link>
        <Link to="/team-status">Team</Link>
        <Link to="/settings">Settings</Link>

        {/* ✅ 로그인 상태에 따라 로그인/로그아웃 버튼을 다르게 표시 */}
        {document.cookie.includes("accessToken") ? (
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        ) : (
          <Link to="/login" className="login-btn">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;