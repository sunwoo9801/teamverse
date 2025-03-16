import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/TeamStatusPage.css";
import { getAccessToken } from "../utils/authUtils";

const TeamStatusPage = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [projects, setProjects] = useState([]); // 프로젝트 목록 저장
  const [selectedProject, setSelectedProject] = useState(""); // 선택된 프로젝트 ID
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  // 프로젝트 목록 불러오기
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      const token = getAccessToken();

      try {
        const response = await axios.get("http://localhost:8082/api/user/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const uniqueProjects = Array.from(
          new Map(response.data.map((project) => [project.id, project])).values()
        );

        setProjects(uniqueProjects);
        if (uniqueProjects.length > 0) {
          setSelectedProject(uniqueProjects[0].id);
        }
      } catch (error) {
        setError("❌ 프로젝트 목록 불러오기 실패");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 초대 요청
  const handleInvite = async () => {
    if (!inviteEmail) return alert("📩 초대할 이메일을 입력하세요.");
    if (!selectedProject) return alert("📌 초대할 프로젝트를 선택하세요.");

    const token = getAccessToken();
    setLoading(true);

    try {
      await axios.post(
        `http://localhost:8082/api/team/invite`,
        { email: inviteEmail, projectId: selectedProject },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("✅ 초대가 성공적으로 전송되었습니다!");
      setShowInviteModal(false);
      setInviteEmail("");
    } catch (error) {
      console.error("❌ 초대 실패:", error);
      alert("초대 전송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-status">
      <button className="invite-button" onClick={() => setShowInviteModal(true)}>
        팀원 초대
      </button>

      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>팀원 초대</h3>

            {/* 이메일 입력 */}
            <input
              type="email"
              placeholder="사용자 이메일을 입력하세요"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="input-field"
            />

            {/* 프로젝트 검색 */}
            <input
              type="text"
              placeholder="프로젝트 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field search-bar"
            />

            {/* 프로젝트 선택 */}
            <label>초대할 프로젝트 선택:</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="dropdown"
            >
              {projects
                .filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
            </select>

            {/* 초대하기 버튼 */}
            <button className="primary-button" onClick={handleInvite} disabled={loading}>
              {loading ? "초대 중..." : "초대하기"}
            </button>
            <button className="secondary-button" onClick={() => setShowInviteModal(false)}>
              취소
            </button>
          </div>
        </div>
      )}

      {/* 프로젝트 목록 로딩 상태 */}
      {loading && <p>⏳ 프로젝트 목록 불러오는 중...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default TeamStatusPage;
