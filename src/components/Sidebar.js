// Sidebar.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import "../styles/Sidebar.css";
import defaultProfileImage from "../assets/images/basicprofile.jpg";

const Sidebar = ({ projectId }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [search, setSearch] = useState("");

  // 현재 로그인한 유저 정보 가져오기
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user ? user.id : null;

  // 새 창(팝업)으로 채팅창 열기
  const openChatWindow = (recipientId, recipientName) => {
    const windowFeatures = "width=400,height=600,left=1000,top=100,resizable,scrollbars";
    // recipientName과 함께 popup 쿼리 파라미터 추가
    const chatUrl = `/chat/${recipientId}?recipientName=${encodeURIComponent(recipientName)}&popup=true`;
    const chatWindow = window.open(chatUrl, "_blank", windowFeatures);
    if (chatWindow) {
      chatWindow.focus();
    } else {
      alert("팝업 차단을 해제해주세요!");
    }
  };

  // 팀원 목록 가져오기
  useEffect(() => {
    if (!projectId) return;
    const token = getAccessToken();
    axios
      .get(`http://localhost:8082/api/user/projects/${projectId}/team-members`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setTeamMembers(response.data))
      .catch((error) => console.error("팀원 목록 불러오기 실패:", error));
  }, [projectId]);

  return (
    <div className="sidebar">
      <h3>참여자</h3>
      <input
        type="text"
        placeholder="🔍 팀원 검색..."
        className="search-bar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul className="team-list">
        {teamMembers
          .filter((member) =>
            member.username.toLowerCase().includes(search.toLowerCase())
          )
          .map((member) => (
            <li
              key={member.id}
              className="team-member"
              onClick={() => {
                if (member.id === userId) {
                  alert("본인에게 메시지를 보낼 수 없습니다.");
                  return;
                }
                openChatWindow(member.id, member.username);
              }}
            >
              <img
                src={member.profileImage || defaultProfileImage}
                alt="Profile"
                className="avatar"
              />
              <div className="member-info">
                <strong>{member.username}</strong>
                <span className={`role ${member.role.toLowerCase()}`}>
                  {member.role}
                </span>
              </div>
              <div className={`status ${member.online ? "online" : "offline"}`}></div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
