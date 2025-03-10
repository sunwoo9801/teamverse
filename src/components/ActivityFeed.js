import React, { useState, useEffect } from "react";
import parse from "html-react-parser"; // HTML을 변환하는 라이브러리
import ReactMarkdown from "react-markdown"; // Markdown 지원 추가
import remarkGfm from "remark-gfm"; // 테이블, 링크, 줄바꿈 지원 추가
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import { getStompClient } from "../api/websocket"; // WebSocket 클라이언트 가져오기
import defaultProfileImage from "../assets/images/basicprofile.jpg"; // 기본 프로필 이미지 import
import "../styles/ActivityFeed.css";



// 감정 리액션 종류 정의
const reactions = [
  { type: "LIKE", label: "좋아요", emoji: "😊" },
  { type: "REQUEST", label: "부탁해요", emoji: "🥺" },
  { type: "HARD", label: "힘들어요", emoji: "😫" },
  { type: "GREAT", label: "훌륭해요", emoji: "🤩" },
  { type: "THANKS", label: "감사해요", emoji: "😍" },
]

const ActivityContent = ({ content, task }) => {
  console.log("렌더링할 content:", content, task);

  if (!content) return <p>내용 없음</p>;

  let parsedContent;
  try {
    parsedContent = typeof content === "string" ? JSON.parse(content) : content;
  } catch (error) {
    console.error("❌ JSON 파싱 실패:", error);
    parsedContent = { title: "제목 없음", content };
  }

  return (
    <div className="activity-content">
      <h3>{parsedContent.title || "제목 없음"}</h3>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsedContent.content || "내용 없음"}</ReactMarkdown>

      {task && (
        <div className="task-info">
          <span className={`task-status ${task.status.toLowerCase()}`}>{task.status}</span>
          <p>📅 {task.startDate} ~ {task.dueDate}</p>
          <p>👤 담당자: {task.assignedTo?.username || "없음"}</p>
        </div>
      )}
    </div>
  );
};




const ActivityFeed = ({ projectId }) => {
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [userProfiles, setUserProfiles] = useState({}); // 사용자 프로필 캐싱
  const [showReactionBox, setShowReactionBox] = useState(null);
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [expandedActivity, setExpandedActivity] = useState({}); // 활동 로그의 확장 상태 저장
  const [expandedTask, setExpandedTask] = useState({}); // 작업(Task)의 확장 상태 저장
  const MAX_LINES = 10;
  const MAX_CHARACTERS = 300;

  const fetchTasks = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8082/api/user/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const updatedTasks = await Promise.all(
        response.data.map(async (task) => {
          try {
            // 리액션 개수 가져오기
            const reactionCountResponse = await axios.get(`http://localhost:8082/api/likes/task/${task.id}/count`, {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            });

            return {
              id: task.id,
              name: task.name,
              description: task.description || "설명이 없습니다.",
              startDate: task.startDate || "미정", // 시작일 기본값 설정
              dueDate: task.dueDate || "미정", // 마감일 기본값 설정
              status: task.status || "TODO", // 상태 기본값 설정
              assignedTo: task.assignedTo || { username: "없음" }, // 담당자 정보 추가
              reactionCounts: reactionCountResponse.data, // 리액션 개수 포함
            };
          } catch (error) {
            console.error(`❌ Task ID ${task.id}의 리액션 개수 불러오기 실패:`, error);
            return {
              ...task,
              reactionCounts: {}, // 오류 발생 시 기본값 설정
              assignedTo: task.assignedTo || { username: "없음" },
            };
          }
        })
      );

      setTasks(updatedTasks);
    } catch (error) {
      console.error("❌ 작업 목록 불러오기 실패:", error);
    }
  };



  // 활동 로그 가져오기
  const fetchActivities = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8082/api/activity/feed/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      console.log("받아온 피드 데이터:", response.data); // 디버깅 로그 추가
      setActivities(response.data);
    } catch (error) {
      console.error("❌ 활동 피드 불러오기 실패:", error);
    }
  };


  const handleReaction = async (id, type, isTask = false) => {
    let token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const payload = isTask ? { taskId: id, type } : { activityId: id, type };

    console.log("전송할 데이터:", JSON.stringify(payload)); // 전송 데이터 확인

    try {
      const response = await axios.post(
        "http://localhost:8082/api/likes/toggle",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      console.log("리액션 성공:", response.data);

      // 추가: 리액션 수 업데이트
      const reactionCountUrl = isTask
        ? `http://localhost:8082/api/likes/task/${id}/count`
        : `http://localhost:8082/api/likes/${id}/count`;

      const countResponse = await axios.get(reactionCountUrl, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      console.log("업데이트된 리액션 개수:", countResponse.data);

      if (isTask) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === id ? { ...task, reactionCounts: countResponse.data } : task
          )
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


  // 현재 로그인한 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8082/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      console.log("현재 로그인한 사용자 정보:", response.data);
      setUser(response.data);
      localStorage.setItem("userId", response.data.id); // userId 저장
    } catch (error) {
      console.error("❌ 사용자 정보 불러오기 실패:", error);
    }
  };

  const fetchFeed = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // ActivityLog (Post) 가져오기
      const activityResponse = await axios.get(`http://localhost:8082/api/activity/feed/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      // Task (업무) 가져오기
      const taskResponse = await axios.get(`http://localhost:8082/api/user/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });


      console.log("받아온 업무 데이터:", taskResponse.data);

      setActivities(activityResponse.data); // Post 데이터
      setTasks(taskResponse.data); // Task 데이터
    } catch (error) {
      console.error("❌ 피드 불러오기 실패:", error);
    }
  };

  const handleLike = async (id, type) => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8082/api/likes/${id}/toggle`,
        { type }, // 좋아요 요청 시 type 추가 (activity 또는 task)
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const isLiked = response.data.liked;

      if (type === "activity") {
        setActivities((prevActivities) =>
          prevActivities.map((activity) =>
            activity.id === id ? { ...activity, liked: isLiked } : activity
          )
        );
      } else if (type === "task") {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === id ? { ...task, liked: isLiked } : task
          )
        );
      }
    } catch (error) {
      console.error("❌ 좋아요 처리 실패:", error);
    }
  };




  // WebSocket을 통한 실시간 피드 & Task 업데이트
  useEffect(() => {
    fetchFeed();
    fetchTasks();

    const stompClient = getStompClient();


    const onActivityReceived = (message) => {

      const newActivity = JSON.parse(message.body);
      // 중복 체크 (같은 ID가 있으면 추가하지 않음)
      setActivities((prevActivities) => {
        const isDuplicate = prevActivities.some(activity => activity.id === newActivity.id);
        if (isDuplicate) return prevActivities; // 중복이면 기존 상태 유지

        return [newActivity, ...prevActivities];
      });
    };

    // WebSocket을 통한 Task 업데이트
    const onTaskReceived = (message) => {
      const newTask = JSON.parse(message.body);
      console.log(" 새 작업(Task) 수신:", newTask);
      setTasks((prevTasks) => [newTask, ...prevTasks]); // 🔹 새로운 Task를 기존 목록 앞에 추가
    };

    if (stompClient.connected) {
      console.log(`🟢 WebSocket 구독: /topic/feed/${projectId}`);
      stompClient.subscribe(`/topic/feed/${projectId}`, onActivityReceived);
      stompClient.subscribe(`/topic/tasks/${projectId}`, onTaskReceived);
    } else {
      console.warn("⚠️ WebSocket이 아직 연결되지 않음, 재연결 시도...");
      stompClient.onConnect = () => {
        console.log(`WebSocket 연결됨, 구독: /topic/feed/${projectId}`);
        stompClient.subscribe(`/topic/feed/${projectId}`, onActivityReceived);
        stompClient.subscribe(`/topic/tasks/${projectId}`, onTaskReceived);
      };
    }

    return () => {
      if (stompClient.connected) {
        stompClient.unsubscribe(`/topic/feed/${projectId}`);
        stompClient.unsubscribe(`/topic/tasks/${projectId}`);
        console.log("🛑 WebSocket 구독 해제됨");
      }
    };
  }, [projectId]);


  return (
    <div className="activity-feed">
      {activities.length === 0 && tasks.length === 0 ? (
        <p className="empty-message">아직 활동 내역이 없습니다.</p>
      ) : (
        <>
          {activities.map((activity) => (
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
                className={`activity-content ${expandedActivity[activity.id] ? "expanded" : ""} ${(activity.content.split("\n").length > MAX_LINES || activity.content.length > MAX_CHARACTERS ||
                  activity.content.includes("<img") || activity.files?.some(file => /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(file)))
                  ? "truncated"
                  : ""
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
                                <img
                                  src={fileUrl}
                                  alt="업로드 이미지"
                                  className="uploaded-image"
                                  style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }}
                                />) : (
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


              {(activity.content.split("\n").length > MAX_LINES || activity.content.length > MAX_CHARACTERS ||
                activity.content.includes("<img") || activity.files?.some(file => /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(file))) && (
                  <button
                    className="toggle-expand-button"
                    onClick={() => setExpandedActivity((prev) => ({ ...prev, [activity.id]: !prev[activity.id] }))}
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
                  {activity.selectedReaction
                    ? reactions.find((r) => r.type === activity.selectedReaction)?.emoji
                    : "🙂 좋아요"}
                </button>
{/* 
                <button className="reaction-button">🔖 북마크</button>
                <button className="reaction-button">⏰ 다시 알림</button>
 */}

                {/* 마우스 오버 시 리액션 박스 표시 */}
                {hoveredActivity === activity.id && (
                  <div className="reaction-box">
                    {reactions.map(({ type, label, emoji }) => (
                      <button key={type} className="reaction-item" onClick={() => handleReaction(activity.id, type)}>
                        {emoji} {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>


              {/* 현재 리액션 요약 */}
              < div className="reaction-summary" >
                {
                  activity.reactionCounts &&
                  Object.entries(activity.reactionCounts || {}).map(([type, count]) => (
                    <span key={type}>
                      {reactions.find((r) => r.type === type)?.emoji} {count}
                    </span>
                  ))
                }
              </div>

              <div className="comment-box">
                <input type="text" placeholder="줄바꿈 Shift + Enter / 입력 Enter 입니다." />
                <button>✏️</button>
              </div>
            </div>
          ))
          }

          {/* Task 추가 피드 표시 */}
          {tasks.map((task) => (
            <div key={task.id} className="activity-card">
              <div className="activity-header">
                <div className="user-container">
                  <img
                    src={userProfiles[task.assignedTo?.id] || defaultProfileImage}
                    alt="프로필"
                    className="profile-img"
                  />
                  <div className="user-info">
                    <span className="username">{task.assignedTo?.username || "담당자 없음"}</span>
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
              </div>

              {/* Task 정보 + 파일 첨부 */}
              <div
                className={`activity-content ${expandedTask[task.id] ? "expanded" : ""} ${(task.description.split("\n").length > MAX_LINES || task.description.length > MAX_CHARACTERS ||
                  task.description.includes("<img") || task.files?.some(file => /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(file)))
                  ? "truncated"
                  : ""
                  }`}
              >
                <h3>📝 {task.name}</h3>
                {parse(task.description || "설명이 없습니다.")}

                {/* Task 상태, 일정, 담당자 정보 */}
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

                {/* Task 업로드 파일 렌더링 */}
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
                              />) : (
                              <a href={`http://localhost:8082${file}`} target="_blank" className="file-name">
                                📄 {file.split("/").pop()}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
              {/* Task에서도 "⋯" 버튼으로 변경 & 스타일 개선 */}
              {(task.description.split("\n").length > MAX_LINES || task.description.length > MAX_CHARACTERS ||
                task.description.includes("<img") || task.files?.some(file => /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(file))) && (
                  <button
                    className="toggle-expand-button"
                    onClick={() => setExpandedTask((prev) => ({ ...prev, [task.id]: !prev[task.id] }))}
                  >
                    {expandedTask[task.id] ? "▲" : "⋯"}
                  </button>
                )}



              {/* 리액션 UI */}
              <div
                className="reaction-container"
                onMouseEnter={() => setHoveredTask(task.id)}
                onMouseLeave={() => setHoveredTask(null)}
              >
                <button className="reaction-button" onClick={() => handleReaction(task.id, "LIKE", true)}>
                  {task.selectedReaction
                    ? reactions.find((r) => r.type === task.selectedReaction)?.emoji
                    : "🙂 좋아요"}
                </button>

                {/* <button className="reaction-button">🔖 북마크</button>
                <button className="reaction-button">⏰ 다시 알림</button> */}

                {/* 마우스 오버 시 리액션 박스 표시 */}
                {hoveredTask === task.id && (
                  <div className="reaction-box">
                    {reactions.map(({ type, label, emoji }) => (
                      <button key={type} className="reaction-item" onClick={() => handleReaction(task.id, type, true)}>
                        {emoji} {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>


              {/* 현재 Task 리액션 요약 */}
              <div className="reaction-summary">
                {task.reactionCounts &&
                  Object.entries(task.reactionCounts || {}).map(([type, count]) => (
                    <span key={type}>
                      {reactions.find((r) => r.type === type)?.emoji} {count}
                    </span>
                  ))}
              </div>

              <div className="comment-box">
                <input type="text" placeholder="줄바꿈 Shift + Enter / 입력 Enter 입니다." />
                <button>✏️</button>
              </div>
            </div>


          ))
          }
        </>
      )}
    </div >
  );

};
export default ActivityFeed;

