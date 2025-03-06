import React, { useState, useEffect, useRef } from "react";
import { getAccessToken } from "../utils/authUtils";
import { getStompClient } from "../api/websocket";
import "../styles/PrivateChatModal.css";

const PrivateChatModal = ({ userId, recipientId, recipientName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef(null);
  const stompClientRef = useRef(null);

  // ✅ 기존 채팅 내역 불러오기
  const fetchChatHistory = async () => {
    if (!userId || !recipientId) return;
    const token = getAccessToken();

    try {
      const response = await fetch(
        `http://localhost:8082/api/chat/private/${recipientId}?senderId=${userId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!response.ok) {
        console.error("❌ [채팅] 채팅 기록 조회 실패:", response.status);
        return;
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("❌ [채팅] 채팅 기록 불러오기 오류:", error);
    }
  };

  // ✅ 메시지 전송
  const sendMessage = () => {
    if (!newMessage.trim() || !userId || !recipientId) return;
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.error("🚨 WebSocket 연결이 안 되어 메시지를 보낼 수 없습니다!");
      return;
    }

    const messageData = {
      senderId: userId,
      recipientId: recipientId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log("📨 메시지 전송:", messageData);

    stompClientRef.current.publish({
      destination: "/app/chat/private/send",
      body: JSON.stringify(messageData),
    });

    // ✅ UI에 즉시 반영
    setMessages((prevMessages) => [...prevMessages, messageData]);
    setNewMessage("");

    
  };

  // ✅ WebSocket 연결 설정
  useEffect(() => {
    if (!userId || !recipientId) return;
  
    fetchChatHistory();
  
    // 기존 WebSocket을 유지하고, 새 구독만 추가
    if (!stompClientRef.current || !stompClientRef.current.connected) {
        const stompClient = getStompClient();
        stompClientRef.current = stompClient;
  
        stompClient.onConnect = () => {
            console.log(`✅ WebSocket 연결 성공! ${recipientId}와의 1:1 채팅 구독 중...`);
  
            stompClient.subscribe(`/topic/chat/private/${userId}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                console.log("📥 [WebSocket] 메시지 수신:", receivedMessage);
  
                setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            });
        };
  
        stompClient.activate();
    } else {
        // ✅ 기존 WebSocket이 있다면, 추가 구독만 실행
        stompClientRef.current.subscribe(`/topic/chat/private/${userId}`, (message) => {
            const receivedMessage = JSON.parse(message.body);
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });
    }
  
    return () => {
        console.log("🛑 개인 채팅 구독 해제 (WebSocket 연결 유지)");
    };
  }, [userId, recipientId]);
  

  // ✅ messages 변경 시 최신 메시지로 스크롤
  useEffect(() => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);
  

  return (
    <div className="private-chat-modal">
      <div className="private-chat-header">📩 {recipientName}님과 1:1 채팅</div>
      <div className="private-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`private-message ${msg.senderId === userId ? "sent" : "received"}`}>
            <span className="message-text">{msg.content}</span>
            <span className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <div className="private-message-input">
        <input
          className="private-inputtext"
          type="text"
          placeholder="메시지를 입력하세요..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="private-button" onClick={sendMessage}>전송</button>
      </div>
      <button className="private-close-btn" onClick={onClose}>닫기</button>
    </div>
  );
};

export default PrivateChatModal;
