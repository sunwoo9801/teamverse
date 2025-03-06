import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import { getStompClient } from "../api/websocket";
import "../styles/Chatbox.css";

const Chatbox = ({ projectId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef(null);
  const stompClientRef = useRef(null);

  const fetchChatMessages = async () => {
    if (!projectId) return;
    const token = getAccessToken();

    try {
      const response = await axios.get(`http://localhost:8082/api/chat/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
        "Cache-Control": "no-cache, no-store, must-revalidate", // ✅ 사파리 캐싱 방지
        Pragma: "no-cache",
        Expires: "0",
      });
      setMessages(response.data);
    } catch (error) {
      console.error("❌ 채팅 기록 불러오기 실패:", error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !projectId) return;
    if (!stompClientRef.current || !stompClientRef.current.connected) {
        console.error("🚨 WebSocket이 연결되지 않아 메시지를 보낼 수 없음!");
        return;
    }

    const userEmail = localStorage.getItem("email") || sessionStorage.getItem("email");

    const messageData = {
        project: { id: projectId },
        sender: { email: userEmail },
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
    };

    console.log("📨 메시지 전송:", messageData);

    stompClientRef.current.publish({
        destination: "/app/chat",
        body: JSON.stringify(messageData),
    });

    setNewMessage("");
};

useEffect(() => {
  if (!projectId) return;

  fetchChatMessages();

  // WebSocket 연결이 이미 활성화되어 있으면 재사용
  if (!stompClientRef.current || !stompClientRef.current.connected) {
      const stompClient = getStompClient();
      stompClientRef.current = stompClient;

      stompClient.onConnect = () => {
          console.log(`✅ WebSocket 연결 성공! 프로젝트 ${projectId} 구독 중...`);

          stompClient.subscribe(`/topic/chat/${projectId}`, (message) => {
              const receivedMessage = JSON.parse(message.body);
              console.log("📨 새 메시지 수신:", receivedMessage);

              setMessages((prevMessages) => [...prevMessages, receivedMessage]);

              // ✅ 사파리에서는 강제 업데이트
              fetchChatMessages();
          });
      };

      stompClient.activate();
  } else {
      // ✅ 이미 WebSocket이 연결되어 있다면, 추가 구독만 실행
      stompClientRef.current.subscribe(`/topic/chat/${projectId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });
  }

  return () => {
      console.log("🛑 팀 채팅 WebSocket 구독 해제 (연결은 유지)");
  };
}, [projectId]);


useEffect(() => {
  // ✅ messages 변경될 때마다 최신 메시지로 스크롤
  setTimeout(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, 100);
}, [messages]);
  return (
    <div className="chatbox-container">
      <h3>💬 팀 채팅</h3>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender.email === localStorage.getItem("email") ? "my-message" : "other-message"}`}>
            <span className="sender">{msg.sender.username}</span>
            <p>{msg.content}</p>
            <span className="timestamp">
            {new Date(msg.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
          </span>
                </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <div className="message-input">
        <input
          type="text"
          className="inputtext"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="메시지를 입력하세요..."
        />
        <button className="button" onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
};

export default Chatbox;
