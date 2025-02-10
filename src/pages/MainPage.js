// import React, { useState, useEffect } from "react";
// import Sidebar from "../components/Sidebar";
// import GanttChart from "../components/GanttChart";
// import Chatbox from "../components/Chatbox";
// import Dashboard from "../components/Dashboard";
// import TaskBoard from "../components/TaskBoard";
// import "../styles/MainPage.css";
// import axios from "axios";
// import { useNavigate, useParams } from "react-router-dom";

// const MainPage = () => {
//     const [projects, setProjects] = useState([]);
//     const [selectedProject, setSelectedProject] = useState(null);
//     const [showModal, setShowModal] = useState(false);
//     const [projectName, setProjectName] = useState("");
//     const [user, setUser] = useState(null);
//     const { userId } = useParams(); // ✅ userId 가져오기
//     const navigate = useNavigate(); // 수정: useNavigate 훅 사용


//     // 🔹 로그인한 유저 정보 가져오기
//     const fetchUserInfo = async () => {
//         const token = localStorage.getItem("accessToken");
//         if (!token) {
//             navigate("/login"); // 수정: 로그인하지 않은 경우 로그인 페이지로 이동
//             return;
//         }

//         try {
//             const response = await axios.get("http://localhost:8082/api/auth/me", {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//             });

//             console.log("✅ 로그인한 사용자 정보:", response.data);
//             setUser(response.data);
//             localStorage.setItem("user", JSON.stringify(response.data));


//             // 수정: 로그인 후 사용자 ID 기반 URL 이동
//             navigate(`/dashboard/${response.data.id}`);

//         } catch (error) {
//             console.error("❌ 사용자 정보 불러오기 실패:", error);
//             navigate("/login"); // 수정: 사용자 정보 로드 실패 시 로그인 페이지로 이동

//         }
//     };

//     // 🔹 로그인한 유저의 프로젝트 불러오기
//     const fetchProjects = async () => {
//         const token = localStorage.getItem("accessToken");
//         if (!token) return;

//         try {
//             const response = await axios.get("http://localhost:8082/api/user/projects", {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//             });

//             console.log("✅ 프로젝트 목록:", response.data);
//             setProjects(response.data);

//             // const savedProjectId = localStorage.getItem("selectedProjectId");
//             // if (savedProjectId) {
//             //     const foundProject = response.data.find(proj => proj.id === parseInt(savedProjectId));
//             //     if (foundProject) {
//             //         setSelectedProject(foundProject);
//             //     }
//             // }

//             if (response.data.length > 0) {
//                 const savedProjectId = localStorage.getItem("selectedProjectId");
//                 if (savedProjectId) {
//                     const foundProject = response.data.find(proj => proj.id === parseInt(savedProjectId));
//                     if (foundProject) {
//                         setSelectedProject(foundProject);
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error("❌ 프로젝트 목록 불러오기 실패:", error);
//             alert("프로젝트 데이터를 불러올 수 없습니다.");
//         }
//     };

//     // ✅ 처음 렌더링될 때 유저 정보 및 프로젝트 가져오기
//     // useEffect(() => {
//     //     fetchUserInfo();
//     //     fetchProjects();
//     // }, []);
//     useEffect(() => {
//         const fetchUserInfo = async () => {
//             const token = localStorage.getItem("accessToken");
//             if (!token) {
//                 console.error("🚨 토큰이 없습니다! 로그인 페이지로 이동합니다.");
//                 navigate("/login");
//                 return;
//             }

//             try {
//                 const response = await axios.get("http://localhost:8082/api/auth/me", {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });

//                 console.log("📌 MainPage에서 가져온 사용자 정보:", response.data);

//                 if (response.data.id !== parseInt(userId)) {
//                     console.warn("🚨 URL의 userId와 로그인한 사용자 ID가 다름!");
//                     navigate(`/dashboard/${response.data.id}`);
//                 }

//                 setUser(response.data);
//             } catch (error) {
//                 console.error("❌ 사용자 정보를 불러오는 데 실패했습니다:", error);
//                 navigate("/login"); // 🚨 401 Unauthorized 응답이 오면 로그인 페이지로 이동
//             }
//         };

//         fetchUserInfo();
//     }, [userId, navigate]);



//     const handleCreateProject = async () => {
//         const token = localStorage.getItem("accessToken");
//         if (!token) {
//             alert("로그인이 필요합니다.");
//             return;
//         }

//         try {
//             const response = await axios.post(
//                 "http://localhost:8082/api/user/projects",
//                 { name: projectName, startDate: new Date().toISOString().split("T")[0] },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );

//             console.log("✅ 프로젝트 생성 성공:", response.data);
//             setProjects([...projects, response.data]);
//             setSelectedProject(response.data);
//             localStorage.setItem("selectedProjectId", response.data.id);
//             setShowModal(false);
//         } catch (error) {
//             console.error("❌ 프로젝트 생성 실패:", error);
//             alert("프로젝트 생성에 실패했습니다.");
//         }
//     };

//     return (
//         <div className="main-page">
//             <div className="content">
//                 {projects.length === 0 ? (
//                     <div className="empty-gantt">
//                         <p>현재 프로젝트가 없습니다.</p>
//                         <button className="create-project-btn" onClick={() => setShowModal(true)}>
//                             새로운 프로젝트 생성
//                         </button>
//                     </div>
//                 ) : (
//                     <GanttChart project={projects[0]} />
//                 )}
//                 <TaskBoard />
//                 <Dashboard tasks={[]} />
//             </div>
//             <div className="chatbox-container">
//                 <Sidebar />
//                 <Chatbox />
//             </div>

//             {/* 🔹 프로젝트 생성 모달 */}
//             {showModal && (
//                 <div className="modal">
//                     <div className="modal-content">
//                         <h2>새 프로젝트 생성</h2>
//                         <input
//                             type="text"
//                             placeholder="프로젝트 이름"
//                             value={projectName}
//                             onChange={(e) => setProjectName(e.target.value)}
//                         />
//                         <button onClick={handleCreateProject}>생성</button>
//                         <button onClick={() => setShowModal(false)}>취소</button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default MainPage;

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import GanttChart from "../components/GanttChart";
import Chatbox from "../components/Chatbox";
import Dashboard from "../components/Dashboard";
import TaskBoard from "../components/TaskBoard";
import "../styles/MainPage.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const MainPage = () => {
    const [projects, setProjects] = useState([]); // ✅ 프로젝트 목록 저장
    const [selectedProject, setSelectedProject] = useState(null); // ✅ 선택한 프로젝트 저장
    const [showModal, setShowModal] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [user, setUser] = useState(null);
    const { userId } = useParams();
    const navigate = useNavigate();

    // ✅ 프로젝트 목록 불러오기
    useEffect(() => {
        const fetchProjects = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            try {
                const response = await axios.get("http://localhost:8082/api/user/projects", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                console.log("✅ 프로젝트 목록:", response.data);
                setProjects(response.data);

                // 데이터가 teamProjects 내부에 있는 경우 대응
                if (Array.isArray(response.data) && response.data.length > 0) {
                    setProjects(response.data);
                } else if (response.data.teamProjects) {
                    const extractedProjects = response.data.teamProjects.map(tp => tp.project);
                    setProjects(extractedProjects);
                } else {
                    console.warn("🚨 예상과 다른 API 응답 구조:", response.data);
                }
            } catch (error) {
                console.error("❌ 프로젝트 목록 불러오기 실패:", error);

                // 수정: 401 Unauthorized 발생 시 로그인 페이지로 이동
                if (error.response?.status === 401) {
                    console.warn("🚨 인증 만료 - 다시 로그인 필요");
                    localStorage.removeItem("accessToken");
                    navigate("/login");
                }

                alert("프로젝트 데이터를 불러올 수 없습니다.");
            }
        };

        fetchProjects();
    }, []);

    // 추가가: 새로운 Access Token 발급
    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            navigate("/login");
            return;
        }

        try {
            const response = await axios.post("http://localhost:8082/api/auth/refresh", {
                refreshToken,
            });

            localStorage.setItem("accessToken", response.data.accessToken);
            console.log("✅ 새 Access Token 발급:", response.data.accessToken);
            return response.data.accessToken;
        } catch (error) {
            console.error("🚨 토큰 갱신 실패, 다시 로그인 필요:", error);
            navigate("/login");
        }
    };
    // ✅ 새로운 프로젝트 생성
    const handleCreateProject = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:8082/api/user/projects",
                { name: projectName, startDate: new Date().toISOString().split("T")[0] },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("✅ 프로젝트 생성 성공:", response.data);
            setProjects([...projects, response.data]);
            setSelectedProject(response.data);
            localStorage.setItem("selectedProjectId", response.data.id);
            setShowModal(false);
        } catch (error) {
            console.error("❌ 프로젝트 생성 실패:", error);
            alert("프로젝트 생성에 실패했습니다.");
        }
    };

    return (
        <div className="main-page">
            <div className="content">
                {/* ✅ 프로젝트 목록 표시 */}
                <div className="project-list">
                    <h2>📂 프로젝트 목록</h2>
                    {projects.length === 0 ? (
                        <p>현재 프로젝트가 없습니다.</p>
                    ) : (
                        <ul>
                            {projects.map((project) => (
                                <li key={project.id}>
                                    <button
                                        className={`project-btn ${selectedProject?.id === project.id ? "active" : ""}`}
                                        onClick={() => {
                                            setSelectedProject(project);
                                            localStorage.setItem("selectedProjectId", project.id);
                                        }}
                                    >
                                        {/* 수정: 프로젝트 이름이 없을 경우 대비 */}
                                        {project?.name || "🚨 이름 없음"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button className="create-project-btn" onClick={() => setShowModal(true)}>
                        새로운 프로젝트 생성
                    </button>
                </div>

                {/* ✅ 선택한 프로젝트의 간트 차트 표시 */}
                {selectedProject ? (
                    <div className="project-details">
                        <h2>📊 {selectedProject.name} - Gantt Chart</h2>
                        <GanttChart project={selectedProject} />
                    </div>
                ) : (
                    <p className="no-project-selected">📌 프로젝트를 선택해주세요.</p>
                )}

                <TaskBoard />
                <Dashboard tasks={[]} />
            </div>
            <div className="chatbox-container">
                <Sidebar />
                <Chatbox />
            </div>

            {/* 🔹 프로젝트 생성 모달 */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>새 프로젝트 생성</h2>
                        <input
                            type="text"
                            placeholder="프로젝트 이름"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                        />
                        <button onClick={handleCreateProject}>생성</button>
                        <button onClick={() => setShowModal(false)}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainPage;
