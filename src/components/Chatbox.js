// import React, { useState } from 'react';
// import '../styles/Chatbox.css';
// import FileManager from './FileManager';
// import connectToChat from '../utils/ConnectToChat';


// const Chatbox = () => {
//   const [messages, setMessages] = useState([
//     { id: 1, user: 'Alice', content: 'Hello Team!' },
//     { id: 2, user: 'Bob', content: 'Hi Alice!' },
//   ]);

//   const [input, setInput] = useState('');

//   const handleSend = () => {
//     if (input.trim()) {
//       setMessages([...messages, { id: messages.length + 1, user: 'You', content: input }]);
//       setInput('');
//     }
//   };

//   return (
//     <div className="chatbox">
//       <h3>Chat</h3>
//       <div className="messages">
//         {messages.map((msg) => (
//           <p key={msg.id}>
//             <strong>{msg.user}: </strong>{msg.content}
//           </p>
//         ))}
//       </div>
//       <div className="input-area">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type a message"
//         />
//         <button onClick={handleSend}>Send</button>

//       </div>
//       <FileManager /> {/* 파일 관리 기능 추가 */}
//     </div>
//   );
// };

// export default Chatbox;

import React, { useState, useEffect } from 'react';
import '../styles/Chatbox.css';
import FileManager from './FileManager';
import { Client } from "@stomp/stompjs";
import axios from "axios";
import { getAccessTokenFromCookie } from "../utils/utils"; // ✅ `utils.js`에서 가져오도록 수정

const Chatbox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    console.log("✅ Chatbox 컴포넌트 마운트됨 - useEffect 실행");

    // ✅ 수정됨: localStorage 대신 쿠키에서 accessToken 가져오기
    const storedToken = getAccessTokenFromCookie(); // 쿠키에서 토큰 가져오기
    
    setAccessToken(storedToken);

    if (!storedToken) {
      console.warn("⛔ Access Token 없음, WebSocket 연결 중단");
      return;
    }

    console.log("🔍 현재 Access Token:", storedToken);

    const connectWebSocket = async () => {
      try {
        console.log("🔍 WebSocket 연결 시도 - Access Token:", storedToken);

        // ✅ 수정됨: Authorization 헤더 추가하여 secondary-token 요청
        const response = await axios.post("http://localhost:8082/api/user/secondary-token", {}, {
          headers: { 
            Authorization: `Bearer ${storedToken}`, // ✅ Authorization 헤더 추가
            "Content-Type": "application/json"
          },
          withCredentials: true 
        });

        const secondaryToken = response.data.secondaryToken;
        console.log("✅ Secondary Token:", secondaryToken);

        // ✅ 수정됨: WebSocket 클라이언트 설정
        const client = new Client({
          brokerURL: `ws://localhost:8082/ws?secondaryToken=${secondaryToken}`,
          reconnectDelay: 5000,
          onConnect: (frame) => {
            console.log("🟢 WebSocket 연결 성공:", frame);

            // ✅ 채팅방 구독
            client.subscribe("/topic/chat/1", (message) => {
              const receivedMessage = JSON.parse(message.body);
              console.log("📩 수신된 메시지:", receivedMessage);
              setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            });

            setStompClient(client);
          },
          onStompError: (frame) => {
            console.error("⛔ WebSocket 연결 실패:", frame);
          }
        });

        client.activate();
      } catch (error) {
        console.error("❌ Secondary Token 요청 실패:", error);
      }
    };

    if (!stompClient) {
      connectWebSocket();
    }

    return () => {
      console.log("🔴 Chatbox 언마운트됨 - WebSocket 종료");
      if (stompClient) {
        stompClient.deactivate();
        console.log("🔴 WebSocket 연결 종료");
      }
    };
  }, [stompClient]); // ✅ stompClient 의존성 추가 (중복 연결 방지)

  const handleSend = () => {
    if (input.trim() && stompClient) {
      const message = { user: "You", content: input, teamId: 1 };
      stompClient.publish({ destination: "/app/chat/send", body: JSON.stringify(message) });
      setInput('');
    }
  };

  return (
    <div className="chatbox">
      <h3>Team Chat</h3>
      <div className="messages">
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.user}: </strong>{msg.content}
          </p>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={handleSend}>Send</button>
      </div>
      <FileManager />
    </div>
  );
};

export default Chatbox;
