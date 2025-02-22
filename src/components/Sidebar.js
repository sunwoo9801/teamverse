import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import "../styles/Sidebar.css";
import defaultProfileImage from "../assets/images/basicprofile.jpg"; // ✅ 기본 프로필 이미지 추가


const Sidebar = ({ projectId }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [search, setSearch] = useState("");

  // ✅ 팀원 목록 가져오기
  const fetchTeamMembers = async () => {
    if (!projectId) return;

    const token = getAccessToken();
    try {
      const response = await axios.get(
        `http://localhost:8082/api/user/projects/${projectId}/team-members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeamMembers(response.data);
    } catch (error) {
      console.error("❌ 팀원 목록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
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
          .filter((member) =>
            member.username.toLowerCase().includes(search.toLowerCase())
          )
          .map((member) => (
            <li key={member.id} className="team-member">
              {/* ✅ 프로필 이미지 표시 (등록된 이미지가 없으면 기본 이미지) */}
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
              <div className={`status ${member.online ? "online" : "offline"}`}>
                {/* {member.online ? "🟢" : "⚪️"} */}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
