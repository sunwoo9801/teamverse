import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import "../styles/Sidebar.css";
import defaultProfileImage from "../assets/images/basicprofile.jpg";
import PrivateChatModal from "./PrivateChatModal";

const Sidebar = ({ projectId }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // ✅ 현재 로그인한 유저 정보 가져오기 (JSON.parse 필요!)
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user ? user.id : null;

  // ✅ userId 값이 정상적으로 있는지 콘솔로 확인
  useEffect(() => {
    console.log(`🔎 현재 로그인한 userId: ${userId}`);
    if (!userId) {
      console.error("❌ localStorage에 userId가 존재하지 않습니다! 로그인 상태를 확인하세요.");
    }
  }, []);

  // ✅ 팀원 목록 가져오기
  useEffect(() => {
    if (!projectId) return;

    const token = getAccessToken();
    axios
      .get(`http://localhost:8082/api/user/projects/${projectId}/team-members`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setTeamMembers(response.data))
      .catch((error) => console.error("❌ 팀원 목록 불러오기 실패:", error));
  }, [projectId]);

  return (
    <div className="sidebar">
      <h3>👥 팀 멤버</h3>
      <input
        type="text"
        placeholder="🔍 팀원 검색..."
        className="search-bar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul className="team-list">
        {teamMembers
          .filter((member) => member.username.toLowerCase().includes(search.toLowerCase()))
          .map((member) => (
            <li
              key={member.id}
              className="team-member"
              data-id={member.id}
              onClick={() => {
                if (member.id === userId) {
                  alert("❌ 본인에게 메시지를 보낼 수 없습니다.");
                  return;
                }
                console.log("📌 클릭한 유저:", member.username, "ID:", member.id);
                setSelectedUser({ id: member.id, username: member.username });
              }}
            >
              <img
                src={member.profileImage || defaultProfileImage}
                alt="Profile"
                className="avatar"
              />
              <div className="member-info">
                <strong>{member.username}</strong>
                <span className={`role ${member.role.toLowerCase()}`}>{member.role}</span>
              </div>
              <div className={`status ${member.online ? "online" : "offline"}`}></div>
            </li>
          ))}
      </ul>

      {/* ✅ 개인 메시지 모달 추가 */}
      {selectedUser && userId && (
        <PrivateChatModal
          userId={userId} // ✅ 현재 로그인한 유저 ID 전달
          recipientId={selectedUser.id} // ✅ 클릭한 팀원의 ID 전달
          recipientName={selectedUser.username}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default Sidebar;
