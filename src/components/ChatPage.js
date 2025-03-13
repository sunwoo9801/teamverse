// ChatPage.js
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAccessToken } from "../utils/authUtils";
import { getStompClient } from "../api/websocket";
import emojiThumbnail from "../assets/images/emoji.png";
import "../styles/ChatPage.css";

const ChatPage = () => {
  const { recipientId } = useParams();
  // URL query parameter에서 recipientName 추출 (없으면 기본값 "상대방")
  const queryParams = new URLSearchParams(window.location.search);
  const recipientName = queryParams.get("recipientName") || "상대방";

  // 로그인한 유저 정보 가져오기
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user ? user.id : null;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef(null);
  const stompClientRef = useRef(null);

  // ✅ 이모티콘 관련 상태
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  // 사용자가 소유한 이모티콘 id 목록 (초기에는 비어있음)
  const [ownedEmojis, setOwnedEmojis] = useState([]);

  // 이모티콘 목록 (추후 여러 이모티콘 추가 가능)
  const emojiList = [
    { id: 'emoji1', src: emojiThumbnail, name: '스마일', price: 10 },
    // 다른 이모티콘들을 추가할 수 있습니다.
  ];

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

  // ✅ 일반 메시지 전송
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
      isEmoji: false,
    };

    console.log("📨 메시지 전송:", messageData);

    // ✅ WebSocket으로 메시지 전송
    stompClientRef.current.publish({
      destination: `/topic/chat/private/${recipientId}`,
      body: JSON.stringify(messageData),
    });

    // ✅ 내가 보낸 메시지는 즉시 UI에 추가
    setMessages((prevMessages) => [...prevMessages, messageData]);

    // 입력 필드 초기화
    setNewMessage("");

    // ✅ REST API로 메시지 저장
    const token = getAccessToken();
console.log("🛠️ 현재 액세스 토큰:", token);

fetch("http://localhost:8082/api/chat/private/save", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(messageData),
})
  .then(async (res) => {
    if (!res.ok) {
      console.error("❌ 메시지 저장 실패:", res.status);
      const errorText = await res.text();
      console.error("🛠️ 서버 응답 내용:", errorText);
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then((data) => console.log("✅ 이모티콘 메시지 저장 완료", data))
  .catch((error) => console.error("❌ 메시지 저장 중 오류 발생:", error));

  };

  // ✅ 이모티콘 메시지 전송
  const sendEmojiMessage = async (emoji) => {
    if (!userId || !recipientId) return;
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.error("🚨 WebSocket 연결 오류!");
      return;
    }

    // ✅ 이모티콘 이미지를 Base64로 변환
    const toBase64 = async (imgSrc) => {
      const response = await fetch(imgSrc);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result);
      });
    };

    const base64Emoji = await toBase64(emoji.src);
    console.log("📷 변환된 Base64 이미지 데이터:", base64Emoji);

    const messageData = {
      senderId: userId,
      recipientId: recipientId,
      content: base64Emoji, // ✅ Base64로 변환된 이미지 데이터 저장
      timestamp: new Date().toISOString(),
      isEmoji: true,
    };

    stompClientRef.current.publish({
      destination: `/topic/chat/private/${recipientId}`,
      body: JSON.stringify(messageData),
    });

    setMessages((prevMessages) => [...prevMessages, messageData]);

    fetch("http://localhost:8082/api/chat/private/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(messageData),
    })
      .then((res) => res.json())
      .then((data) => console.log("✅ 이모티콘 메시지 저장 완료", data))
      .catch((error) => console.error("❌ 이모티콘 메시지 저장 실패:", error));
  };



  // ✅ 이모티콘 패널 토글
  const toggleEmojiPanel = () => {
    setShowEmojiPanel(!showEmojiPanel);
  };

  // ✅ 이모티콘 선택 처리: 소유 여부에 따라 구매 흐름 진행
  const handleEmojiSelect = (emoji) => {
    if (!ownedEmojis.includes(emoji.id)) {
      // 소유하지 않은 경우 구매 모달 표시
      setSelectedEmoji(emoji);
      setShowPurchaseModal(true);
    } else {
      // 소유한 경우 바로 전송
      sendEmojiMessage(emoji);
      setShowEmojiPanel(false);
    }
  };

  // ✅ 구매 모달 - 결제 확인
  // 결제 모달에서 "결제" 버튼 클릭 시 호출되는 함수
  const handlePurchaseConfirm = () => {
    if (!window.IMP) {
      alert("결제 모듈을 로드할 수 없습니다.");
      return;
    }

    window.IMP.init("imp34540415");

    const paymentData = {
      pg: "html5_inicis",
      pay_method: "card",
      merchant_uid: `payment-${crypto.randomUUID()}`,
      name: "이모티콘 구매",
      amount: selectedEmoji.price,
      buyer_email: user.email || "user@example.com",
      buyer_name: user.name || "홍길동",
      buyer_tel: user.phone || "010-0000-0000",
      buyer_addr: "서울시 강남구",
      buyer_postcode: "12345",
    };

    window.IMP.request_pay(paymentData, async function (response) {
      if (response.error_code) {
        alert(`결제 실패: ${response.error_msg}`);
        return;
      }

      try {
        const SERVER_BASE_URL = "http://localhost:8082";
        const verified = await fetch(`${SERVER_BASE_URL}/payment/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAccessToken()}`,
          },
          body: JSON.stringify({
            imp_uid: response.imp_uid,
            merchant_uid: response.merchant_uid,
            amount: selectedEmoji.price,
          }),
        });

        if (!verified.ok) {
          alert("결제 검증에 실패했습니다.");
          return;
        }

        // 구매 정보 서버에 저장
        const saveResponse = await fetch(`http://localhost:8082/api/user/${userId}/emojis`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAccessToken()}`,
          },
          body: JSON.stringify({ emojiId: selectedEmoji.id }),
        });

        if (!saveResponse.ok) {
          console.error("이모티콘 구매 정보 저장 실패:", saveResponse.status);
        }

        setOwnedEmojis((prev) => [...prev, selectedEmoji.id]);
        sendEmojiMessage(selectedEmoji);
        setSelectedEmoji(null);
        setShowPurchaseModal(false);
        setShowEmojiPanel(false);

      } catch (error) {
        console.error("결제 검증 중 오류 발생:", error);
        alert("결제 검증 중 오류 발생");
      }
    });
  };




  // ✅ 구매 모달 - 취소
  const handlePurchaseCancel = () => {
    setShowPurchaseModal(false);
    setSelectedEmoji(null);
  };

  // ✅ WebSocket 연결 설정
  useEffect(() => {
    if (!userId || !recipientId) return;

    fetchChatHistory();

    if (!stompClientRef.current || !stompClientRef.current.connected) {
      const stompClient = getStompClient();
      stompClientRef.current = stompClient;

      stompClient.onConnect = () => {
        console.log(`✅ WebSocket 연결 성공! ${recipientId}와의 1:1 채팅 구독 중...`);

        stompClient.subscribe(`/topic/chat/private/${userId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);

          // ✅ 중복 메시지 방지: 기존 메시지 목록에 같은 내용이 있는지 확인
          setMessages((prevMessages) => {
            const isDuplicate = prevMessages.some(
              (msg) =>
                msg.senderId === receivedMessage.senderId &&
                msg.recipientId === receivedMessage.recipientId &&
                msg.content === receivedMessage.content &&
                msg.timestamp === receivedMessage.timestamp
            );

            return isDuplicate ? prevMessages : [...prevMessages, receivedMessage];
          });
        });
      };

      stompClient.activate();
    } else {
      stompClientRef.current.subscribe(`/topic/chat/private/${userId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);

        // ✅ 중복 메시지 방지
        setMessages((prevMessages) => {
          const isDuplicate = prevMessages.some(
            (msg) =>
              msg.senderId === receivedMessage.senderId &&
              msg.recipientId === receivedMessage.recipientId &&
              msg.content === receivedMessage.content &&
              msg.timestamp === receivedMessage.timestamp
          );

          return isDuplicate ? prevMessages : [...prevMessages, receivedMessage];
        });
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

  useEffect(() => {
    if (window.IMP) {
      console.log("✅ 포트원 SDK 로드됨!");
      window.IMP.init("imp34540415"); // 고객사 식별 코드
    } else {
      console.error("❌ 포트원 SDK 로드 실패!");
    }
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/v1/iamport.js";
    script.async = true;
    script.onload = () => {
      console.log("✅ 포트원 SDK 로드 완료!");
      window.IMP.init("imp34540415"); // 고객사 식별 코드
    };
    script.onerror = () => {
      console.error("❌ 포트원 SDK 로드 실패!");
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchOwnedEmojis = async () => {
      const token = getAccessToken();
      try {
        const response = await fetch(`http://localhost:8082/api/user/${userId}/emojis`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          // 예: data가 ["emoji1", "emoji2"] 형태라고 가정
          setOwnedEmojis(data);
        } else {
          console.error("구매한 이모티콘 목록 조회 실패:", response.status);
        }
      } catch (error) {
        console.error("구매한 이모티콘 조회 중 오류:", error);
      }
    };

    if (userId) {
      fetchOwnedEmojis();
    }
  }, [userId]);

  return (
    <div className="chat-page">
      <head>
      <script src="https://cdn.iamport.kr/v1/iamport.js"></script>
      </head>
      <header className="chat-header">
        <button className="close-btn" onClick={() => window.close()}>닫기</button>
        <h2>💬 {recipientName}님과의 채팅</h2>
      </header>

      <div className="chat-messages">
  {messages.length === 0 ? (
    <p className="no-messages">대화 내역이 없습니다.</p>
  ) : (
    messages.map((msg, index) => (
      <div
        key={index}
        className={`chat-message ${msg.senderId === userId ? "sent" : "received"}`}
      >
        <div className="message-content">
          {/* ✅ 메시지가 Base64 데이터인지 또는 파일 경로인지 판단하여 이미지 렌더링 */}
          {msg.content.startsWith("data:image/png;base64,") ? (
            <img src={msg.content} alt="이모티콘" className="sent-emoji" />
          ) : msg.content.startsWith("/uploads/") ? (
            <img
              src={`http://localhost:8082${msg.content}`}
              alt="이모티콘"
              className="sent-emoji"
            />
          ) : (
            <>
              <span className="message-text">{msg.content}</span>
              <span className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </>
          )}
        </div>
      </div>
    ))
  )}
  <div ref={messageEndRef} />
</div>


      <div className="chat-input">
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        {/* 이모티콘 버튼 */}
        <button className="emoji-btn" onClick={toggleEmojiPanel}>😊</button>
        <button onClick={sendMessage}>전송</button>
      </div>

      {/* 이모티콘 목록 패널 */}
      {showEmojiPanel && (
        <div className="emoji-panel">
          {emojiList.map((emoji) => (
            <img
              key={emoji.id}
              src={emoji.src}
              alt="이모티콘 썸네일"
              onClick={() => handleEmojiSelect(emoji)}
              className="emoji-thumbnail"
            />
          ))}
        </div>
      )}

      {/* 구매 모달 */}
      {showPurchaseModal && (
        <div className="purchase-modal">
          <div className="purchase-modal-content">
            <h3>이모티콘 구매</h3>
            <p>이 이모티콘을 구매하시겠습니까?</p>
            {selectedEmoji && (
              <img
                src={selectedEmoji.src}
                alt="구매할 이모티콘"
                className="purchase-emoji-thumbnail"
              />
            )}
            <div className="modal-buttons">
              <button onClick={handlePurchaseConfirm}>결제</button>
              <button onClick={handlePurchaseCancel}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
