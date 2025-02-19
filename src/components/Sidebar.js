import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import "../styles/Sidebar.css";

const Sidebar = ({ projectId }) => {
  const [teamMembers, setTeamMembers] = useState([]);

  // ✅ 팀원 목록 가져오기
  const fetchTeamMembers = async () => {
    if (!projectId) {
      console.log("🚨 projectId가 없습니다. API 호출 중단");
      return;
    }
  
    console.log(`📌 팀원 목록 요청: projectId=${projectId}`);
  
    const token = getAccessToken();
    try {
      const response = await axios.get(
        `http://localhost:8082/api/user/projects/${projectId}/team-members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      console.log("📌 API 응답 데이터:", response.data); // 응답 확인
  
      setTeamMembers(response.data);
    } catch (error) {
      console.error("❌ 팀원 목록 불러오기 실패:", error);
    }
  };
  
  useEffect(() => {
    console.log("📌 Sidebar에서 감지된 프로젝트 ID:", projectId);
    fetchTeamMembers();
  }, [projectId]);
  

  return (
    <div className="sidebar">
      <h3>👥 팀 멤버</h3>
      {teamMembers.length === 0 ? (
        <p>현재 팀원이 없습니다.</p>
      ) : (
        <ul>
          {teamMembers.map((member) => (
            <li key={member.id}>
              <strong>{member.username}</strong> <span>({member.role})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
