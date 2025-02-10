import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/Navbar.css";

const Navbar = () => {
  const [invitations, setInvitations] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ 사용자 정보 불러오기
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("accessToken"); // 수정: accessToken 사용
      if (!token) {
        console.error("🚨 JWT 토큰이 없습니다! 로그인이 필요합니다.");
        return;
      }

      const response = await axios.get("http://localhost:8082/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      localStorage.setItem("user", JSON.stringify(response.data));
      setUser(response.data);
    } catch (error) {
      console.error("❌ 사용자 정보 불러오기 실패:", error);
    }
  };

  // ✅ 초대 목록 불러오기
  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:8082/api/team/invitations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInvitations(response.data);
      if (response.data.length > 0) setShowPopup(true);
    } catch (error) {
      console.error("초대 목록 불러오기 실패:", error);
    }
  };

  // ✅ 초대 수락하기
  const acceptInvite = async (inviteId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8082/api/invites/${inviteId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ 초대를 수락했습니다!");
      fetchInvitations(); // 새 초대 목록 다시 불러오기
    } catch (error) {
      console.error("❌ 초대 수락 실패:", error);
    }
  };

  // ✅ 로그아웃
  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("refreshToken");
  //   localStorage.removeItem("user");
  //   setUser(null);
  //   window.location.href = "/login";
  // };

  // useEffect(() => {
  //   fetchUserInfo();
  //   fetchInvitations();
  // }, []);
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken"); // 🔹 추가: 로그아웃 시 Authorization 헤더에 토큰 포함
 if (!token) {
      console.error("🚨 JWT 토큰이 없습니다! 로그아웃 요청을 할 수 없습니다.");
      return; // 🔹 토큰이 없으면 로그아웃 요청을 실행하지 않음
    }

  await axios.post("http://localhost:8082/api/auth/logout", {}, {
      headers: { Authorization: `Bearer ${token}` }, // 🔹 추가: Authorization 헤더 포함
      withCredentials: true
    });

      // ✅ 쿠키 삭제 (브라우저에서 강제 삭제)
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
     
    // ✅ 로컬스토리지 삭제
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

      setUser(null); // 로그아웃 후 사용자 상태 초기화
      alert("로그아웃 되었습니다.");
      window.location.href = "/";
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // 수정: 페이지 로드시 사용자 정보 자동 불러오기
  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">TeamVerse</div>

      {/* ✅ 초대 팝업 */}
      {showPopup && (
        <div className="invitation-popup">
          <h2>초대 알림</h2>
          <ul>
            {invitations.map((invite) => (
              <li key={invite.id}>
                <p>{invite.email}님이 팀 초대를 보냈습니다.</p>
                <button className="accept-btn" onClick={() => acceptInvite(invite.id)}>
                  수락
                </button>
              </li>
            ))}
          </ul>
          <button className="close-btn" onClick={() => setShowPopup(false)}>닫기</button>
        </div>
      )}

      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/statistics">Statistics</Link>
        <Link to="/team-status">Team</Link>
        <Link to="/settings">Settings</Link>
        {user ? (
          <Link
            to="/login"
            onClick={(e) => {
              e.preventDefault(); // 기본 이동 방지
              handleLogout(); // 로그아웃 함수 실행
            }}
          >
            Logout
          </Link>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
