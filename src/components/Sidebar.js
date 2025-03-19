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

  // userId 값이 정상적으로 있는지 콘솔로 확인
  useEffect(() => {
    if (!userId) {
      console.error("❌ localStorage에 userId가 존재하지 않습니다! 로그인 상태를 확인하세요.");
    }
  }, []);

  //  팀원 목록 가져오기
  const fetchTeamMembers = async () => {
    if (!projectId) return;

    const token = getAccessToken();
    try {
      const response = await axios.get(
        `http://localhost:8082/api/user/projects/${projectId}/team-members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // 멤버 데이터에서 profileImage가 없을 경우 기본 이미지 설정
      const updatedMembers = response.data.map(member => ({
        ...member,
        profileImage: member.profileImage && member.profileImage.trim() !== ""
          ? member.profileImage
          : defaultProfileImage
      }));

      setTeamMembers(updatedMembers);

      // setTeamMembers(response.data);
    } catch (error) {
      console.error("❌ 팀원 목록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [projectId]);

  return (
    <div className="sidebar_2">
      <h3>팀 멤버</h3>
      <input
        type="text"
        placeholder="팀원 검색..."
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
                onError={(e) => {
                  e.target.src = defaultProfileImage; // 기본 이미지로 변경
                }}
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

