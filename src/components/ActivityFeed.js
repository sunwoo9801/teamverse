import React, { useState, useEffect, useMemo } from "react";
import parse from "html-react-parser"; // HTML 변환 라이브러리
import ReactMarkdown from "react-markdown"; // Markdown 지원
import remarkGfm from "remark-gfm"; // 테이블, 링크, 줄바꿈 지원
import axios from "axios";
import CommentList from "./CommentList"; // 댓글 컴포넌트
import TaskModal from "./TaskModal"; // TaskModal 임포트
import { getAccessToken } from "../utils/authUtils";
import { getStompClient } from "../api/websocket"; // WebSocket 클라이언트
import defaultProfileImage from "../assets/images/basicprofile.jpg"; // 기본 프로필 이미지
import { FaRegThumbsUp, FaPrayingHands, FaTired, FaFire, FaHeart } from "react-icons/fa";
import "../styles/ActivityFeed.css";

const reactions = [
  { type: "LIKE", label: "좋아요", icon: <FaRegThumbsUp size={20} color="#A6A6A6" /> },
  { type: "REQUEST", label: "부탁해요", icon: <FaPrayingHands size={20} color="#A6A6A6" /> },
  { type: "HARD", label: "힘들어요", icon: <FaTired size={20} color="#A6A6A6" /> },
  { type: "GREAT", label: "훌륭해요", icon: <FaFire size={20} color="#A6A6A6" /> },
  { type: "THANKS", label: "감사해요", icon: <FaHeart size={20} color="#A6A6A6" /> },
];

const MAX_LINES = 10;
const MAX_CHARACTERS = 300;

const ActivityFeed = ({ projectId }) => {
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [expandedActivity, setExpandedActivity] = useState({});
  const [expandedTask, setExpandedTask] = useState({});
  const [visibleCount, setVisibleCount] = useState(8);
  const [menuOpen, setMenuOpen] = useState(null); // 드롭다운 메뉴 상태
  const [isModalOpen, setIsModalOpen] = useState(false); // TaskModal 상태
  const [editTask, setEditTask] = useState(null); // 수정할 Task
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser); // ✅ user 상태 설정
    console.log("📌 현재 로그인한 사용자 정보:", storedUser);
  }, []);


  // Task 목록 새로고침 함수
  const refreshTasks = () => {
    fetchTasks();
  };

  // --- 피드(활동, Task) 및 사용자 데이터 fetch ---
  // Task 목록 불러오기
  const fetchTasks = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8082/api/user/projects/${projectId}/tasks`,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      const updatedTasks = await Promise.all(
        response.data.map(async (task) => {
          try {
            const reactionCountResponse = await axios.get(
              `http://localhost:8082/api/likes/task/${task.id}/count`,
              { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
            );
            return {
              ...task,
              reactionCounts: reactionCountResponse.data,
              assignedTo: task.assignedTo || { username: "없음" },
              createdBy: task.createdBy, // 작성자 ID 추가
              createdByUsername: task.createdByUsername, // 작성자 이름 추가
            };
          } catch (error) {
            console.error(`❌ Task ID ${task.id}의 리액션 개수 불러오기 실패:`, error);
            return {
              ...task,
              reactionCounts: {},
              assignedTo: task.assignedTo || { username: "없음" },
              createdBy: task.createdBy,
              createdByUsername: task.createdByUsername || "알 수 없는 사용자",
            };
          }
        })
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error("❌ 작업 목록 불러오기 실패:", error);
    }
  };
  const fetchActivities = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8082/api/activity/feed/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      console.log("받아온 피드 데이터:", response.data);
      setActivities(response.data);
    } catch (error) {
      console.error("❌ 활동 피드 불러오기 실패:", error);
    }
  };

  // Task 삭제 함수 수정
  const handleDeleteTask = async (taskId) => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!window.confirm("정말로 이 업무를 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`http://localhost:8082/api/user/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      alert("업무가 성공적으로 삭제되었습니다.");
      refreshTasks(); // 목록 새로고침으로 통일
      setMenuOpen(null);
    } catch (error) {
      console.error("❌ Task 삭제 실패:", error);
      alert("업무 삭제에 실패했습니다.");
    }
  };

  // 더보기 메뉴 토글
  const toggleMenu = (taskId) => {
    setMenuOpen((prev) => (prev === taskId ? null : taskId));
  };

  // 리액션 처리 함수 (활동 및 Task 공용)
  const handleReaction = async (id, type, isTask = false) => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    const payload = isTask ? { taskId: id, type } : { activityId: id, type };
    try {
      const response = await axios.post(
        "http://localhost:8082/api/likes/toggle",
        payload,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      // 업데이트된 리액션 개수 가져오기
      const reactionCountUrl = isTask
        ? `http://localhost:8082/api/likes/task/${id}/count`
        : `http://localhost:8082/api/likes/${id}/count`;
      const countResponse = await axios.get(reactionCountUrl, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (isTask) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === id ? { ...task, reactionCounts: countResponse.data } : task))
        );
      } else {
        setActivities((prevActivities) =>
          prevActivities.map((activity) =>
            activity.id === id ? { ...activity, reactionCounts: countResponse.data } : activity
          )
        );
      }
    } catch (error) {
      console.error("❌ 리액션 처리 실패:", error);
    }
  };

  // --- WebSocket을 통한 실시간 업데이트 ---
  // useEffect(() => {
  //   fetchActivities();
  //   fetchTasks();

  //   const stompClient = getStompClient();
  //   const onActivityReceived = (message) => {
  //     const newActivity = JSON.parse(message.body);
  //     setActivities((prevActivities) => {
  //       const isDuplicate = prevActivities.some(activity => activity.id === newActivity.id);
  //       return isDuplicate ? prevActivities : [newActivity, ...prevActivities];
  //     });
  //   };

  //   const onTaskReceived = (message) => {
  //     const newTask = JSON.parse(message.body);
  //     console.log("새 작업(Task) 수신:", newTask);
  //     setTasks((prevTasks) => [
  //       {
  //         ...newTask,
  //         createdByUsername: newTask.createdByUsername || "알 수 없는 사용자", // 작성자 이름 보장
  //       },
  //       ...prevTasks,
  //     ]);
  //   };

  //   if (stompClient.connected) {
  //     console.log(`🟢 WebSocket 구독: /topic/feed/${projectId}`);
  //     stompClient.subscribe(`/topic/feed/${projectId}`, onActivityReceived);
  //     stompClient.subscribe(`/topic/tasks/${projectId}`, onTaskReceived);
  //   } else {
  //     console.warn("⚠️ WebSocket이 아직 연결되지 않음, 재연결 시도...");
  //     stompClient.onConnect = () => {
  //       console.log(`WebSocket 연결됨, 구독: /topic/feed/${projectId}`);
  //       stompClient.subscribe(`/topic/feed/${projectId}`, onActivityReceived);
  //       stompClient.subscribe(`/topic/tasks/${projectId}`, onTaskReceived);
  //     };
  //   }
  //   return () => {
  //     if (stompClient.connected) {
  //       stompClient.unsubscribe(`/topic/feed/${projectId}`);
  //       stompClient.unsubscribe(`/topic/tasks/${projectId}`);
  //       console.log("🛑 WebSocket 구독 해제됨");
  //     }
  //   };
  // }, [projectId]);
  // useEffect에 WebSocket 삭제 이벤트 추가
  useEffect(() => {
    fetchActivities();
    fetchTasks();

    const stompClient = getStompClient();
    const onActivityReceived = (message) => {
      const newActivity = JSON.parse(message.body);
      setActivities((prevActivities) => {
        const isDuplicate = prevActivities.some((activity) => activity.id === newActivity.id);
        return isDuplicate ? prevActivities : [newActivity, ...prevActivities];
      });
    };

    const onTaskReceived = (message) => {
      const newTask = JSON.parse(message.body);
      setTasks((prevTasks) => [
        { ...newTask, createdByUsername: newTask.createdByUsername || "알 수 없는 사용자" },
        ...prevTasks,
      ]);
    };

    const onTaskDeleted = (message) => {
      const deletedTaskId = JSON.parse(message.body);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== deletedTaskId));
    };

    if (stompClient.connected) {
      stompClient.subscribe(`/topic/feed/${projectId}`, onActivityReceived);
      stompClient.subscribe(`/topic/tasks/${projectId}`, onTaskReceived);
      stompClient.subscribe(`/topic/tasks/delete`, onTaskDeleted); // 삭제 구독 추가
    } else {
      stompClient.onConnect = () => {
        stompClient.subscribe(`/topic/feed/${projectId}`, onActivityReceived);
        stompClient.subscribe(`/topic/tasks/${projectId}`, onTaskReceived);
        stompClient.subscribe(`/topic/tasks/delete`, onTaskDeleted);
      };
    }

    return () => {
      if (stompClient.connected) {
        stompClient.unsubscribe(`/topic/feed/${projectId}`);
        stompClient.unsubscribe(`/topic/tasks/${projectId}`);
        stompClient.unsubscribe(`/topic/tasks/delete`);
      }
    };
  }, [projectId]);

  // --- feed 데이터 병합 및 정렬 ---
  const combinedFeed = useMemo(() => {
    const activityFeeds = activities.map(activity => ({ feedType: "activity", ...activity }));
    const taskFeeds = tasks.map(task => ({ feedType: "task", ...task }));
    const allFeeds = [...activityFeeds, ...taskFeeds];
    allFeeds.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.updatedAt);
      const dateB = new Date(b.createdAt || b.updatedAt);
      return dateB - dateA;
    });
    return allFeeds;
  }, [activities, tasks]);

  const visibleFeeds = combinedFeed.slice(0, visibleCount);

  // --- 렌더링 함수 (활동 카드) ---
  const renderActivityCard = (activity) => {
    return (
      <div key={activity.id} className="activity-card">
        <div className="activity-header">
          <div className="user-container">
            <img
              src={userProfiles[activity.userId] || defaultProfileImage}
              alt="프로필"
              className="profile-img"
            />
            <div className="user-info">
              <span className="username">{activity.username || "알 수 없는 사용자"}</span>
              <span className="timestamp">{new Date(activity.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div
          className={`activity-content ${expandedActivity[activity.id] ? "expanded" : ""
            } ${(activity.content.split("\n").length > MAX_LINES ||
              activity.content.length > MAX_CHARACTERS ||
              activity.content.includes("<img") ||
              activity.files?.some((file) => /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(file))) && "truncated"
            }`}
        >
          <h3>{activity.title || "제목 없음"}</h3>
          <p>{parse(activity.content || "내용 없음")}</p>
          <div className="file-list">
            {activity.files &&
              activity.files.length > 0 &&
              !activity.files.some((file) => activity.content.includes(file)) && (
                <div className="file-list">
                  {activity.files.map((file, index) => {
                    const fileUrl = file.startsWith("http") ? file : `http://localhost:8082${file}`;
                    const fileName = file.split("/").pop();
                    return (
                      <div key={index} className="file-container">
                        {/\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(file) ? (
                            <a href={fileUrl} download={fileName} className="file-download-btn">
                          <img
                            src={fileUrl}
                            alt="업로드 이미지"
                            className="uploaded-image"
                            style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }}
                            
                          />
                             <div>{fileName}</div>
                             </a>
                        ) : (
                          <a href={fileUrl} download={fileName} className="file-download-btn">
                            📄 {fileName}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>
        {(activity.content.split("\n").length > MAX_LINES ||
          activity.content.length > MAX_CHARACTERS ||
          activity.content.includes("<img") ||
          activity.files?.some((file) => /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(file))) && (
            <button
              className="toggle-expand-button"
              onClick={() =>
                setExpandedActivity((prev) => ({
                  ...prev,
                  [activity.id]: !prev[activity.id],
                }))
              }
            >
              {expandedActivity[activity.id] ? "▲" : "⋯"}
            </button>
          )}
        {/* 리액션 UI */}
        <div
          className="reaction-container"
          onMouseEnter={() => setHoveredActivity(activity.id)}
          onMouseLeave={() => setHoveredActivity(null)}
        >
          <button className="reaction-button">
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {activity.selectedReaction
                ? reactions.find((r) => r.type === activity.selectedReaction)?.icon
                : <FaRegThumbsUp size={18} />}
              <span style={{ marginLeft: "1px", verticalAlign: "middle", position: "relative", top: "-1px" }}>
                좋아요
              </span>
            </span>
          </button>
          {hoveredActivity === activity.id && (
            <div className="reaction-box">
              {reactions.map(({ type, label, icon }) => (
                <button key={type} className="reaction-item" onClick={() => handleReaction(activity.id, type)}>
                  {icon} {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="reaction-summary">
          {activity.reactionCounts &&
            Object.entries(activity.reactionCounts).map(([type, count]) => (
              <span key={type}>
                {reactions.find((r) => r.type === type)?.icon} {count}
              </span>
            ))}
        </div>
        {/* CommentList에 고유 key 추가 */}
        <CommentList key={`activity-${activity.id}`} projectId={projectId} activityId={activity.id} />
      </div>
    );
  };


  // --- 렌더링 함수 (Task 카드) ---
  const renderTaskCard = (task) => {
    // 디버깅용 콘솔 추가 (확인 완료 후 제거 가능)
    console.log(
      `Task ID: ${task.id}, CreatedBy:`, task.createdBy,
      `User ID: ${user?.id}`,
      `비교 결과:`, task.createdBy?.id === user?.id
    );
    return (
      <div key={task.id} className="activity-card">
        <div className="activity-header">
          <div className="user-container">
            <img
              src={userProfiles[task.createdBy?.id] || defaultProfileImage}
              alt="프로필"
              className="profile-img"
            />
            <div className="user-info">
              <span className="username">
                {task.createdByUsername || task.createdBy?.username || "알 수 없는 사용자"}
              </span>
              <span className="timestamp">
                {task.updatedAt
                  ? new Date(task.updatedAt).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                  : "날짜 없음"}
              </span>
            </div>
          </div>


          {/* 🔹 작성자만 더보기 버튼 표시 (수정 완료) */}
          {task.createdBy?.id === user?.id && (
            <div className="task-feed-more-menu">
              <button className="task-feed-more-button" onClick={() => toggleMenu(task.id)}>
                ⋮
              </button>
              {menuOpen === task.id && (
                <div className="task-feed-dropdown-menu">
                  <button
                    className="task-feed-dropdown-item"
                    onClick={() => {
                      setEditTask(task);
                      setIsModalOpen(true);
                      setMenuOpen(null);
                    }}
                  >
                    수정
                  </button>
                  <button
                    className="task-feed-dropdown-item delete-item"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          )}


        </div>
        <div
          className={`activity-content ${expandedTask[task.id] ? "expanded" : ""} ${(task.description.split("\n").length > MAX_LINES ||
            task.description.length > MAX_CHARACTERS ||
            task.description.includes("<img") ||
            task.files?.some((file) => /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(file))) && "truncated"
            }`}
        >
          <h3>{task.name}</h3>
          {parse(task.description || "설명이 없습니다.")}
          <div className="task-info">
            <span className={`task-status ${task.status.toLowerCase()}`}>{task.status}</span>
            <p>📅 {task.startDate} ~ {task.dueDate}</p>
            <p>👤 담당자: {task.assignedTo?.username || "없음"}</p>
            {task.location && (
              <div className="task-location">
                <span>📍 {task.location}</span>
              </div>
            )}
          </div>
          <div className="file-list">
            {task.files &&
              task.files.length > 0 &&
              !task.files.some((file) => task.description.includes(file)) && (
                <div className="file-list">
                  {task.files.map((file, index) => (
                    <div key={index} className="file-container">
                      {/\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(file) ? (
                        <img
                          src={`http://localhost:8082${file}`}
                          alt="업로드 이미지"
                          className="uploaded-image"
                          style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }}
                        />
                      ) : (
                        <a href={`http://localhost:8082${file}`} target="_blank" rel="noopener noreferrer" className="file-name">
                          📄 {file.split("/").pop()}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
        {(task.description.split("\n").length > MAX_LINES ||
          task.description.length > MAX_CHARACTERS ||
          task.description.includes("<img") ||
          task.files?.some((file) => /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(file))) && (
            <button
              className="toggle-expand-button"
              onClick={() =>
                setExpandedTask((prev) => ({
                  ...prev,
                  [task.id]: !prev[task.id],
                }))
              }
            >
              {expandedTask[task.id] ? "▲" : "⋯"}
            </button>
          )}
        <div
          className="reaction-container"
          onMouseEnter={() => setHoveredTask(task.id)}
          onMouseLeave={() => setHoveredTask(null)}
        >
          <button className="reaction-button">
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {task.selectedReaction
                ? reactions.find((r) => r.type === task.selectedReaction)?.icon
                : <FaRegThumbsUp size={18} />}
              <span style={{ marginLeft: "1px", verticalAlign: "middle", position: "relative", top: "-1px" }}>
                좋아요
              </span>
            </span>
          </button>
          {hoveredTask === task.id && (
            <div className="reaction-box">
              {reactions.map(({ type, label, icon }) => (
                <button key={type} className="reaction-item" onClick={() => handleReaction(task.id, type, true)}>
                  {icon} {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="reaction-summary">
          {task.reactionCounts &&
            Object.entries(task.reactionCounts).map(([type, count]) => (
              <span key={type}>
                {reactions.find((r) => r.type === type)?.icon} {count}
              </span>
            ))}
        </div>
        {/* CommentList에 고유 key 추가 */}
        <CommentList key={`task-${task.id}`} projectId={projectId} taskId={task.id} />
      </div>
    );
  };

  // --- 렌더링 ---
  return (
    <div className="activity-feed">
      {combinedFeed.length === 0 ? (
        <p className="empty-message">아직 활동 내역이 없습니다.</p>
      ) : (
        <>
          {visibleFeeds.map((feedItem) => {
            if (feedItem.feedType === "activity") {
              return renderActivityCard(feedItem);
            } else if (feedItem.feedType === "task") {
              return renderTaskCard(feedItem);
            }
            return null;
          })}
          {visibleCount < combinedFeed.length && (
            <div className="load-more-container">

              <button className="load-more-button" onClick={() => setVisibleCount(visibleCount + 5)}>
                ↓
              </button>
            </div>
          )}
        </>
      )}
      {isModalOpen && (
        <TaskModal
          onClose={() => setIsModalOpen(false)}
          projectId={projectId}
          refreshTasks={refreshTasks}
          editTask={editTask}
        />
      )}

    </div>
  );
};

export default ActivityFeed;
