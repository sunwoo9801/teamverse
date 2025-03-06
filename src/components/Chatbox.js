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
      });
      setMessages(response.data);
    } catch (error) {
      console.error("❌ 채팅 기록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    fetchChatMessages();

    const stompClient = getStompClient();
    stompClientRef.current = stompClient;

    stompClient.onConnect = () => {
      stompClient.subscribe(`/topic/chat/${projectId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });
    };

    stompClient.activate();

    return () => stompClient.deactivate();
  }, [projectId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !projectId) return;
    const userEmail = localStorage.getItem("email") || sessionStorage.getItem("email");

    const messageData = {
      project: { id: projectId },
      sender: { email: userEmail },
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    stompClientRef.current.publish({
      destination: "/app/chat",
      body: JSON.stringify(messageData),
    });

    setNewMessage("");
  };

  return (
    <div className="chatbox-container">
      <h3>💬 팀 채팅</h3>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender.email === localStorage.getItem("email") ? "my-message" : "other-message"}`}>
            <span className="sender">{msg.sender.username}</span>
            <p>{msg.content}</p>
            <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
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
