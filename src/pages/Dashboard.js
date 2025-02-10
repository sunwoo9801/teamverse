import React from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../api/authApi"; // 로그아웃 API 호출

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login"); // 로그아웃 후 로그인 페이지로 이동
  };

  const handleEditProfile = () => {
    navigate("/edit-profile"); // 회원정보 수정 페이지로 이동
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Dashboard</h1>
      <button onClick={handleLogout} style={{ margin: "10px" }}>로그아웃</button>
      <button onClick={handleEditProfile} style={{ margin: "10px" }}>회원정보 수정</button>
    </div>
  );
};

export default Dashboard;
