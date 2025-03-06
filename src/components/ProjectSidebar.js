import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import "../styles/ProjectSidebar.css";

const ProjectSidebar = ({ projectId }) => {
    const [teamMembers, setTeamMembers] = useState([]);

    // ✅ 팀원 목록 가져오기
    useEffect(() => {
        if (!projectId) {
            console.log("🚨 projectId가 없습니다. API 호출 중단");
            return;
        }

        console.log(`📌 팀원 목록 요청: projectId=${projectId}`);

        const fetchTeamMembers = async () => {
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

        fetchTeamMembers();
    }, [projectId]);

    return (
        <div className="project-sidebar">
            <div className="team-members">
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

            <div className="team-chat">
                <h3>💬 팀 채팅</h3>
                <p>아직 메시지가 없습니다.</p>
                <input type="text" placeholder="메시지를 입력하세요..." />
                <button>전송</button>
            </div>
        </div>
    );
};

export default ProjectSidebar;
