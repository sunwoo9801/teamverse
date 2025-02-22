import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import { getStompClient } from "../api/websocket"; // ✅ WebSocket 클라이언트 가져오기
import defaultProfileImage from "../assets/images/basicprofile.jpg"; // 기본 프로필 이미지 import
import "../styles/ActivityFeed.css";

const ActivityFeed = ({ projectId }) => {
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [userProfiles, setUserProfiles] = useState({}); // ✅ 사용자 프로필 캐싱


  // ✅ 현재 프로젝트의 Task 목록 가져오기
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

      console.log("📌 받아온 작업 목록:", response.data);
      setTasks(response.data);

      const uniqueUserIds = [...new Set(response.data.map(task => task.assignedTo?.id).filter(Boolean))] || [];
      if (uniqueUserIds.length > 0) {
        fetchUserProfiles(uniqueUserIds);
      }
    } catch (error) {
      console.error("❌ 작업 목록 불러오기 실패:", error);
    }
  };

  // // ✅ 사용자 ID를 기반으로 프로필 이미지 가져오기
  // const fetchUserProfiles = async (userIds = []) => {
  //   if (!Array.isArray(userIds) || userIds.length === 0) return; // ✅ userIds가 배열이 아니거나 빈 배열이면 실행 안함

  //   const token = getAccessToken();
  //   try {
  //     const responses = await Promise.all(
  //       userIds.map(userId =>
  //         axios.get(`http://localhost:8082/api/users/${userId}`, {
  //           headers: { Authorization: `Bearer ${token}` },
  //           withCredentials: true,
  //         })
  //       )
  //     );

  //     const profiles = {};
  //     responses.forEach(response => {
  //       const userData = response.data;
  //       profiles[userData.id] = userData.profileImage || defaultProfileImage; // ✅ 프로필 없으면 기본 이미지
  //     });

  //     setUserProfiles(profiles);
  //   } catch (error) {
  //     console.error("❌ 사용자 프로필 불러오기 실패:", error);
  //   }
  // };

  const fetchUserProfiles = async () => {
    try {
        const token = localStorage.getItem("accessToken"); // ✅ 토큰 가져오기
        const response = await axios.get("http://localhost:8082/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });

        const userData = response.data;
        console.log("📌 사용자 프로필 불러오기 성공:", userData);

        setUserProfiles((prevProfiles) => ({
            ...prevProfiles,
            [userData.id]: userData.profileImage || defaultProfileImage,
        }));
    } catch (error) {
        console.error("❌ 사용자 프로필 불러오기 실패:", error);
    }
};


  // ✅ 현재 로그인한 사용자 정보 가져오기
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

      console.log("✅ 현재 로그인한 사용자 정보:", response.data);
      setUser(response.data);
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
      const response = await axios.get(`http://localhost:8082/api/activity/feed/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      console.log("📌 받아온 피드 데이터:", response.data); // ✅ 디버깅용 콘솔 추가
      setActivities(response.data);
    } catch (error) {
      console.error("❌ 피드 불러오기 실패:", error);
    }
  };


// ✅ WebSocket을 통한 실시간 피드 & Task 업데이트
useEffect(() => {
  fetchFeed();
  fetchTasks();

  const stompClient = getStompClient();

  const onActivityReceived = (message) => {
    console.log("📩 새 활동 로그 수신:", message.body); // ✅ 로그 추가

    const newActivity = JSON.parse(message.body);
    
    setActivities((prevActivities) => {
        console.log("📝 기존 피드 길이:", prevActivities.length);
        console.log("📝 업데이트 후 피드 길이:", prevActivities.length + 1);
        return [newActivity, ...prevActivities];
    });
};

  // ✅ WebSocket을 통한 Task 업데이트
  const onTaskReceived = (message) => {
    const newTask = JSON.parse(message.body);
    console.log("📩 새 작업(Task) 수신:", newTask);
    setTasks((prevTasks) => [newTask, ...prevTasks]); // 🔹 새로운 Task를 기존 목록 앞에 추가
  };

  if (stompClient.connected) {
    console.log(`🟢 WebSocket 구독: /topic/feed/${projectId}`);
    stompClient.subscribe(`/topic/feed/${projectId}`, onActivityReceived);
    stompClient.subscribe(`/topic/tasks/${projectId}`, onTaskReceived);
  } else {
    console.warn("⚠️ WebSocket이 아직 연결되지 않음, 재연결 시도...");
    stompClient.onConnect = () => {
      console.log(`✅ WebSocket 연결됨, 구독: /topic/feed/${projectId}`);
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
        <p className="empty-message">📌 아직 활동 내역이 없습니다.</p>
      ) : (
        <>
          {/* ✅ 기존 피드 데이터 표시 */}
          {activities.map((activity) => (
            <div key={activity.id} className="activity-card">
              <div className="activity-header">
                {/* ✅ 프로필 사진 + 사용자 정보 정렬 */}
                <div className="user-container">
                  <img
                    src={user?.profileImage || defaultProfileImage}
                    alt="프로필"
                    className="profile-img"
                  />
                  <div className="user-info">
                    <span className="username">{activity.username || "알 수 없는 사용자"}</span>
                    <span className="timestamp">{new Date(activity.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <span className="pin-icon">📌</span>
              </div>


              <div className="activity-content">
                <h3>{activity.activityDescription}</h3>
                <p>{activity.activityDescription.replace("게시글 작성: ", "")}</p>
              </div>

              <div className="activity-actions">
                <button>😊 좋아요</button>
                <button>🔖 북마크</button>
                <button>⏰ 다시 알림</button>
              </div>

              <div className="comment-box">
                <input type="text" placeholder="줄바꿈 Shift + Enter / 입력 Enter 입니다." />
                <button>✏️</button>
              </div>
            </div>
          ))}

          {/* ✅ Task 추가 피드 표시 */}
          {tasks.map((task) => (
            <div key={task.id} className="activity-card">
              <div className="activity-header">
                <div className="user-container">
                  <img
                    src={userProfiles[task.assignedTo?.id] || defaultProfileImage} // ✅ 담당자 프로필 이미지 적용
                    alt="프로필"
                    className="profile-img"
                  />
                  <div className="user-info">
                    <span className="username">{task.assignedTo?.username || "담당자 없음"}</span>
                    <span className="timestamp">
                      {task.updatedAt
                        ? (() => {
                          try {
                            const dateObj = new Date(task.updatedAt);
                            console.log(`📌 [Task] 변환 후 Date 객체:`, dateObj, " → getTime():", dateObj.getTime()); // ✅ 디버깅 추가
                            return isNaN(dateObj.getTime())
                              ? "날짜 오류"
                              : dateObj.toLocaleString("ko-KR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              });
                          } catch (error) {
                            console.error("❌ 날짜 변환 오류:", error);
                            return "날짜 오류";
                          }
                        })()
                        : "날짜 없음"}
                    </span>
                  </div>
                </div>
                <span className="pin-icon">📌</span>
              </div>

              <div className="activity-content">
                <h3>📝 {task.name}</h3>
                <p>{task.description || "설명이 없습니다."}</p>

                {/* ✅ 상태, 일정, 담당자 정보 */}
                <div className="task-info">
                  <span className={`task-status ${task.status.toLowerCase()}`}>{task.status}</span>
                  <p>📅 {task.startDate} ~ {task.dueDate}</p>
                  <p>👤 담당자: {task.assignedTo?.username || "없음"}</p>

                  {/* ✅ 장소 정보 추가 */}
                  {task.location && (
                    <div className="task-location">
                      <span>📍 {task.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
export default ActivityFeed;
