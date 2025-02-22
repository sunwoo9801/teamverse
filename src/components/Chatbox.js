import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import { getStompClient } from "../api/websocket";
import "../styles/Chatbox.css"; 

const Chatbox = ({ projectId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // ✅ 채팅 메시지 불러오기 (초기 로딩 시)
  const fetchChatMessages = async () => {
    if (!projectId) return;
    const token = getAccessToken();
    try {
      const response = await axios.get(`http://localhost:8082/api/chat/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data); // ✅ 상태 업데이트
      console.log("✅ 채팅 메시지 로드 성공:", response.data);
    } catch (error) {
      console.error("❌ 채팅 기록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    console.log(`🔄 Chatbox에서 감지된 프로젝트 ID: ${projectId}`);
    fetchChatMessages();

    const stompClient = getStompClient();
    if (!stompClient.connected) stompClient.activate();
  
    // ✅ WebSocket 구독 (새로운 메시지 수신)
    const subscription = stompClient.subscribe(`/topic/chat/${projectId}`, (message) => {
      const receivedMessage = JSON.parse(message.body);
      console.log("📩 새 채팅 메시지 수신:", receivedMessage);
      setMessages((prevMessages) => [...prevMessages, receivedMessage]); 
    });

    return () => {
      console.log("🛑 WebSocket 구독 해제:", `/topic/chat/${projectId}`);
      subscription.unsubscribe();
    };
  }, [projectId]);

  // ✅ 메시지 전송
  const sendMessage = async () => {
    if (!newMessage.trim() || !projectId) return;
    const userEmail = localStorage.getItem("email") || sessionStorage.getItem("email");
    if (!userEmail) {
      console.error("❌ 로그인한 사용자의 이메일을 찾을 수 없습니다!");
      return;
    }

    try {
      const messageData = {
        project: { id: projectId },
        sender: { email: userEmail },
        content: newMessage.trim(),
      };

      const stompClient = getStompClient();
      if (!stompClient.connected) {
        console.error("🚨 WebSocket이 연결되지 않음!");
        return;
      }

      stompClient.publish({
        destination: `/app/chat`,
        body: JSON.stringify(messageData),
      });

      console.log("📤 메시지 전송:", messageData);
      setNewMessage("");
    } catch (error) {
      console.error("❌ 메시지 전송 실패:", error);
    }
  };

  return (
    <div className="chatbox-container">
      <h3>팀 채팅</h3>
      <div className="messages">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <p key={index}><strong>{msg.sender.email}</strong>: {msg.content}</p>
          ))
        ) : (
          <p>📭 아직 메시지가 없습니다.</p>
        )}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="메시지를 입력하세요..."
      />
      <button onClick={sendMessage}>전송</button>
    </div>
  );
};

export default Chatbox;
