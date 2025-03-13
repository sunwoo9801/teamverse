import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // useNavigate 추가
import axios from "axios";
import { getAccessToken } from "../utils/authUtils"; // 로그인 상태 확인을 위한 accessToken 가져오기
import ProfileModal from "./ProfileModal"; // 모달 컴포넌트 가져오기
import "../styles/Navbar.css";
import defaultProfileImage from "../assets/images/basicprofile.jpg"; // 기본 프로필 이미지 추가
import { FaUserCircle, FaCogs, FaSignOutAlt } from "react-icons/fa"; // 아이콘 추가
import helpimage from "../assets/images/help.png"; // 기본 프로필 이미지 추가


const Navbar = () => {
  const [invitations, setInvitations] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); // 모달 상태
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 추가

  // 사용자 정보 불러오기
  const fetchUserInfo = async () => {
    try {
      const token = getAccessToken(); // 수정: sessionStorage에서도 가져올 수 있도록 변경
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

  // 초대 목록 불러오기
  const fetchInvitations = async () => {
    try {
      const token = getAccessToken(); // 수정: token 가져오는 방식 통일
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

  // 초대 수락하기
  const acceptInvite = async (inviteId) => {
    try {
      const token = getAccessToken(); // 수정: token 가져오는 방식 통일
      await axios.post(
        `http://localhost:8082/api/invites/${inviteId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("초대를 수락했습니다!");
      fetchInvitations(); // 새 초대 목록 다시 불러오기
    } catch (error) {
      console.error("❌ 초대 수락 실패:", error);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      const token = getAccessToken(); // 수정: sessionStorage에서도 가져올 수 있도록 변경
      if (!token) {
        console.error("🚨 JWT 토큰이 없습니다! 로그아웃 요청을 할 수 없습니다.");
        return;
      }

      await axios.post("http://localhost:8082/api/auth/logout", {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      // 쿠키 삭제 (브라우저에서 강제 삭제)
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      // 로컬스토리지 및 세션스토리지 삭제
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("accessToken"); // 추가: sessionStorage에서도 삭제
      sessionStorage.removeItem("refreshToken"); // 추가: sessionStorage에서도 삭제

      setUser(null); // 상태 업데이트
      alert("로그아웃 되었습니다.");
      navigate("/"); // 로그인 페이지로 이동
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // 로그인 상태 확인 후 user 상태 업데이트
  useEffect(() => {
    fetchUserInfo();
  }, []);



  return (
    <nav className="navbar">
      <div className="info">
            <img src={helpimage} alt="help Logo" className="help" />

      <div className="info_help"> 도움말 </div>
      </div>
      {/* <Link to="/dashboard/:userId" className="navbar-logo">
        TeamVerse
      </Link> */}


      {/* 초대 팝업 */}
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

      <div className="navbar-menu">
        <Link to="/dashboard/:userId">대시보드</Link>
        <Link to="/statistics">통계</Link>
        <Link to="/team-status">팀원</Link>
          {/* 프로필을 텍스트로 표시 */}
          {user ? (
          <div className="profile-link">
            <span onClick={() => setShowDropdown(!showDropdown)}>프로필</span>
            {showDropdown && (
              <div className="profile-dropdown">
                {/* 프로필 사진과 유저네임 나란히 배치 */}
                <div className="dropdown-header">
                  <img 
                    src={user.profileImage || defaultProfileImage} 
                    alt="Profile" 
                    className="dropdown-profile-image" 
                  />
                  <p className="dropdown-username">{user.username}</p>
                </div>

                <span className="my_profile" onClick={() => setShowProfileModal(true)}>
                  <FaUserCircle className="icon" /> 내 프로필
                </span>
                
                <Link to="/settings" className="profile_setting">
                  <FaCogs className="icon" /> 설정
                </Link>
                
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt className="icon" /> 로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="login-btn">로그인</Link>
        )}
      </div>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdate={setUser}
      />
    </nav>
  );
};

export default Navbar;
