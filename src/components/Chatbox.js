import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import { getStompClient } from "../api/websocket";
import "../styles/Chatbox.css";

const Chatbox = ({ projectId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    // ✅ 채팅 메시지 불러오기
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

    // ✅ WebSocket 구독
    useEffect(() => {
        if (!projectId) return;

        fetchChatMessages();

        const stompClient = getStompClient();

        if (!stompClient.connected) {
            stompClient.activate();
        }

        // ✅ WebSocket 구독 (Subscribe)
        const subscription = stompClient.subscribe(`/topic/chat/${projectId}`, (message) => {
            const receivedMessage = JSON.parse(message.body);
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [projectId]);

    // ✅ 메시지 전송
    const sendMessage = async () => {
        if (!newMessage.trim() || !projectId) return;

        const userEmail = localStorage.getItem("email");
        const userName = localStorage.getItem("username"); // ✅ 추가: 저장된 username 가져오기
        if (!userEmail || !userName) {
            console.error("❌ 로그인한 사용자 정보를 찾을 수 없습니다!");
            return;
        }

        try {
            const messageData = {
                project: { id: projectId },
                sender: { email: userEmail, username: userName }, // ✅ username 포함
                content: newMessage.trim(),
            };

            // ✅ WebSocket으로 메시지 전송
            const stompClient = getStompClient();
            if (!stompClient || !stompClient.connected) {
                console.error("🚨 WebSocket이 연결되지 않음!");
                return;
            }

            stompClient.publish({
                destination: "/app/chat",
                body: JSON.stringify(messageData),
            });

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
                        <p key={index}>
                            <strong>{msg.sender.username}</strong>: {msg.content} {/* ✅ username 표시 */}
                        </p>
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
