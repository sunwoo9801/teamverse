import React, { useState, useEffect } from "react";
import LeftSidebar from "../components/LeftSidebar"; // LeftSidebar 추가
import InviteList from "../components/InviteList";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../utils/authUtils";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineUserAdd, AiOutlineClose } from "react-icons/ai";
import { BiLoaderAlt } from "react-icons/bi";


const TeamStatusPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
      const [showProjectList, setShowProjectList] = useState(false);
  

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8082/api/user/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.length > 0) {
        setProjects(response.data);
        setSelectedProject(response.data[0]);
        localStorage.setItem("projectId", response.data[0].id);
      }
    } catch (error) {
      console.error("❌ 프로젝트 목록 불러오기 실패:", error);
    }
  };

  const handleCreateProject = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8082/api/user/projects",
        {
          name: projectName.trim() || "새 프로젝트",
          description: projectDescription.trim() || "",
          startDate: new Date().toISOString().split("T")[0],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setProjects([...projects, response.data]);
      setSelectedProject(response.data);
      localStorage.setItem("projectId", response.data.id);
      setShowModal(false);
    } catch (error) {
      console.error("❌ 프로젝트 생성 실패:", error);
    }
  };

  // 초대 요청
  const handleInvite = async () => {
    if (!inviteEmail) return alert("📩 초대할 이메일을 입력하세요.");
    if (!selectedProject) return alert("📌 초대할 프로젝트를 선택하세요.");

    const token = getAccessToken();
    setLoading(true);

    try {
      await axios.post(
        `http://localhost:8082/api/team/invite`,
        { email: inviteEmail, projectId: selectedProject.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("✅ 초대가 성공적으로 전송되었습니다!");
      const newInvitedUsers = [...invitedUsers, { email: inviteEmail, project: selectedProject.id }];
      setInvitedUsers(newInvitedUsers);
      localStorage.setItem("invitedUsers", JSON.stringify(newInvitedUsers));
      
      setShowInviteModal(false);
      setInviteEmail("");
    } catch (error) {
      console.error("❌ 초대 실패:", error);
      alert("초대 전송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };
    // 프로젝트 상세 보기 페이지(TaskPage)로 이동
    const handleProjectClick = (projectId) => {
      navigate(`/task?projectId=${projectId}`);
  };

  const handleShowProjectList = () => {
      setShowProjectList(true);

      // 프로젝트 데이터를 함께 전달하여 이동
      navigate("/TaskBoard", { state: { projects } });
  };

  useEffect(() => {
    const storedInvitedUsers = localStorage.getItem("invitedUsers");
    if (storedInvitedUsers) {
      setInvitedUsers(JSON.parse(storedInvitedUsers)); // 새로고침해도 유지
    }
  }, []);
  return (
<div className="team-status flex flex-row" style={{ height: "calc(100vh - 80px)" }}>
{/* 왼쪽 사이드바 (고정 너비) */}
<div className="sidebar-container w-[300px] bg-gray-100 h-screen flex-shrink-0" 
     style={{ height: "calc(100vh - 80px)" }} >
          <LeftSidebar onCreateProject={() => setShowModal(true)}
            onShowProjectList={handleShowProjectList}
            projectId={selectedProject ? selectedProject.id : null}
            />
    </div>

    {/* 메인 콘텐츠 (팀원 관리) */}
    <div className="bg-gray-100 flex flex-col flex-grow items-center py-8 overflow-y-auto" style={{ height: "calc(100vh - 80px)",backgroundColor: "#c0d5efb0", }}>
      <h2>팀원 관리</h2>

      {/* 초대 버튼 */}
      <button
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        onClick={() => setShowInviteModal(true)}
      >
        <AiOutlineUserAdd size={20} />
        팀원 초대
      </button>

        {/* 초대 모달 */}
        <AnimatePresence>
        {showInviteModal && (
          <motion.div
            className="fixed inset-0 bg-opacity-30 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg w-96 border border-gray-300 border-b pb-3"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">팀원 초대</h3>
                <AiOutlineClose
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                  size={20}
                  onClick={() => setShowInviteModal(false)}
                />
              </div>

              {/* 이메일 입력 */}
              <input
                type="email"
                placeholder="사용자 이메일을 입력하세요"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full mt-3 p-2 border rounded-md"
              />

              {/* 프로젝트 검색 */}
              <input
                type="text"
                placeholder="프로젝트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full mt-2 p-2 border rounded-md"
              />

{/* 프로젝트 선택 */}
<label className="block mt-3 text-sm font-semibold">초대할 프로젝트 선택:</label>
<select
  value={selectedProject ? selectedProject.id : ""}
  onChange={(e) => {
    const projectId = Number(e.target.value); // 숫자로 변환
    const selected = projects.find((p) => p.id === projectId);
    setSelectedProject(selected);
  }}
  className="w-full p-2 mt-2 border rounded-md"
>
  <option value="" disabled>
    프로젝트를 선택하세요
  </option>
  {projects
    .filter((project, index, self) => 
      index === self.findIndex((p) => p.id === project.id) // 중복 제거
    )
    .filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase())) // 검색 필터 적용
    .map((project) => (
      <option key={project.id} value={project.id}>
        {project.name}
      </option>
    ))}
</select>



              {/* 초대 버튼 */}
              <button
                className="w-full bg-blue-500 text-white py-2 mt-4 rounded-md hover:bg-blue-600 transition"
                onClick={handleInvite}
                disabled={loading}
              >
                {loading ? <BiLoaderAlt className="animate-spin inline-block" size={20} /> : "초대하기"}
              </button>
              <button
                className="w-full bg-gray-300 text-gray-700 py-2 mt-2 rounded-md hover:bg-gray-400 transition"
                onClick={() => setShowInviteModal(false)}
              >
                취소
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 초대된 사용자 목록 */}
      <div className="mt-6 w-96">
        <h3 className="text-lg font-semibold">✅ 초대한 사용자 목록</h3>
        {invitedUsers.length === 0 ? (
          <p className="text-gray-500 mt-2">초대한 사용자가 없습니다.</p>
        ) : (
          <ul className="mt-2 border rounded-md p-3 bg-white shadow">
            {invitedUsers.map((user, index) => (
              <li key={index} className="border-b last:border-0 py-2">
                {user.email} - <span className="text-blue-600">{projects.find(p => p.id === user.project)?.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
);
};

export default TeamStatusPage;
