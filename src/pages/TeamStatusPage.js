import React, { useState, useEffect } from "react";
import "../styles/TeamStatusPage.css";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";

const TeamStatusPage = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [projects, setProjects] = useState([]); // user1의 프로젝트 목록 저장
  const [selectedProject, setSelectedProject] = useState(""); // 선택된 프로젝트 ID

  // user1의 프로젝트 목록 불러오기
  useEffect(() => {
    const fetchProjects = async () => {
      const token = getAccessToken();
      try {
        const response = await axios.get("http://localhost:8082/api/user/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setProjects(response.data); // 프로젝트 목록 저장
        if (response.data.length > 0) {
          setSelectedProject(response.data[0].id); // 기본값 설정 (첫 번째 프로젝트)
        }
      } catch (error) {
        console.error("❌ 프로젝트 목록 불러오기 실패:", error);
      }
    };

    fetchProjects();
  }, []);

  // 초대 요청
  const handleInvite = async () => {
    if (!inviteEmail) return alert("초대할 이메일을 입력하세요.");
    if (!selectedProject) return alert("초대할 프로젝트를 선택하세요.");

    const token = getAccessToken();
    try {
      await axios.post(
        `http://localhost:8082/api/team/invite`,
        { email: inviteEmail, projectId: selectedProject }, // 선택된 프로젝트 ID 사용
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("초대가 성공적으로 전송되었습니다!");
    } catch (error) {
      console.error("❌ 초대 실패:", error);
      alert("초대 전송에 실패했습니다.");
    }
  };

  return (
    <div className="team-status">
      <h2>팀 상태</h2>
      <button className="invite-button" onClick={() => setShowInviteModal(true)}>
        팀원 초대
      </button>

      {showInviteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>초대할 사용자 이메일 입력</h3>
            <input
              type="email"
              placeholder="사용자 이메일"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />

            {/* user1의 프로젝트 목록을 선택하는 드롭다운 추가 */}
            <label>초대할 프로젝트 선택:</label>
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <button onClick={handleInvite}>초대하기</button>
            <button onClick={() => setShowInviteModal(false)}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamStatusPage;
