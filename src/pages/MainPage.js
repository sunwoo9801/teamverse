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
import { getAccessToken } from "../utils/authUtils";

const MainPage = () => {
    const [projects, setProjects] = useState([]); // ✅ 프로젝트 목록 저장
    const [selectedProject, setSelectedProject] = useState(null); // ✅ 선택한 프로젝트 저장
    const [tasks, setTasks] = useState([]); // ✅ 선택한 프로젝트의 작업 목록
    const [showModal, setShowModal] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [user, setUser] = useState(null);
    const { userId } = useParams();
    const navigate = useNavigate(); // ✅ 페이지 이동
    const [projectDescription, setProjectDescription] = useState(""); // ✅ 설명 추가


    // ✅ 로그인한 사용자의 프로젝트 목록 불러오기
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
                withCredentials: true,
            });

            console.log("✅ 서버에서 가져온 프로젝트 목록:", response.data);
            if (response.data && response.data.length > 0) {
                const formattedProjects = response.data.map(project => ({
                    ...project,
                    name: project.name ? project.name : "🚨 이름 없음", // ✅ 이름이 없으면 기본값 설정
                }));
                setProjects(formattedProjects);
                handleProjectSelect(formattedProjects[0]); // ✅ 첫 번째 프로젝트 선택
            }
        } catch (error) {
            console.error("❌ 프로젝트 목록 불러오기 실패:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem("accessToken");
                sessionStorage.removeItem("accessToken");
                navigate("/login");
            }
        }
    };

    // 새로운 Access Token 발급
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
            sessionStorage.setItem("accessToken", response.data.accessToken); // ✅ 추가: sessionStorage에도 저장
            console.log("✅ 새 Access Token 발급:", response.data.accessToken);
            return response.data.accessToken;
        } catch (error) {
            console.error("🚨 토큰 갱신 실패, 다시 로그인 필요:", error);
            navigate("/login");
        }
    };

    // ✅ 새로운 프로젝트 생성
    const handleCreateProject = async () => {
        const token = getAccessToken(); // sessionStorage에서도 accessToken을 가져올 수 있도록 변경

        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        try {
            // 사용자가 입력한 값 반영 (빈 값이면 null 처리)
            const newProjectData = {
                name: projectName.trim() !== "" ? projectName.trim() : null,
                description: projectDescription.trim() !== "" ? projectDescription.trim() : null,
                startDate: new Date().toISOString().split("T")[0],
            };

            const response = await axios.post(
                "http://localhost:8082/api/user/projects", newProjectData, {
                // { name: projectName, startDate: new Date().toISOString().split("T")[0] },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            console.log("✅ 새 프로젝트 생성 응답:", response.data);
            // ✅ 프로젝트 생성 후 Task 페이지로 이동
            navigate(`/task?projectId=${response.data.id}`);


            // setProjects([...projects, response.data]);
            // setSelectedProject(response.data);
            // localStorage.setItem("selectedProjectId", response.data.id);
            // setShowModal(false);
            // ✅ 프로젝트 목록에 즉시 추가 (name이 올바르게 존재하는지 확인)
            if (!response.data || !response.data.id) {
                throw new Error("프로젝트 생성 후 ID를 찾을 수 없습니다.");
            }
    
            setProjects((prevProjects) => [...prevProjects, response.data]);
            setSelectedProject(response.data);
            localStorage.setItem("selectedProjectId", response.data.id);
            fetchTasks(response.data.id);
            setShowModal(false);
        } catch (error) {
            console.error("❌ 프로젝트 생성 실패:", error);
            alert("프로젝트 생성에 실패했습니다.");
        }
    };

    // ✅ 선택한 프로젝트의 작업(Task) 목록 불러오기
    const fetchTasks = async (projectId) => {
        const token = getAccessToken();
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8082/api/user/projects/${projectId}/tasks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            console.log(`✅ 프로젝트 ${projectId}의 작업 목록:`, response.data);
            setTasks(response.data);
        } catch (error) {
            console.error(`❌ 프로젝트 ${projectId}의 작업 목록 불러오기 실패:`, error);
        }
    };
    // ✅ 프로젝트 선택 시 처리 함수
    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        fetchTasks(project.id);
        console.log("🔍 선택된 프로젝트:", project);
    };

       // ✅ 프로젝트 상세 보기 페이지(TaskPage)로 이동
       const handleProjectClick = (projectId) => {
        navigate(`/task?projectId=${projectId}`);
    };

    useEffect(() => {
        fetchProjects();
    }, []);


    return (
        <div className="main-page">
            <div className="content">
                {/* ✅ 프로젝트 목록 표시 */}
                <div className="project-list">
                    <h2>📂 프로젝트 목록</h2>
                    {projects.length === 0 ? (
                        <p>현재 프로젝트가 없습니다.</p>
                    ) : (
                        <ul className="project-list-container">
                            {projects.map((project) => (
                                <li key={project.id}>
                                    <button
                                        className={`project-btn ${selectedProject?.id === project.id ? "active" : ""}`}
                                        onClick={() =>
                                            handleProjectSelect(project)
                                            // {setSelectedProject(project);
                                            // localStorage.setItem("selectedProjectId", project.id)}
                                        }
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
                         {/* ✅ 클릭 시 TaskPage로 이동 */}
                         <h2 
                            className="clickable-title" 
                            onClick={() => handleProjectClick(selectedProject.id)}
                            style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }} // ✅ 스타일 추가
                        >
                            📊 {selectedProject.name} - 간트차트
                        </h2>
                        <GanttChart project={selectedProject} tasks={tasks} />
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
                         <input 
                            type="text" 
                            placeholder="프로젝트 설명 (선택 사항)" 
                            value={projectDescription} 
                            onChange={(e) => setProjectDescription(e.target.value)}
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
