
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const getStompClient = (userId, onMessageReceived) => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://teamverse.onrender.com/ws`;

    if (stompClient && stompClient.connected) {
        console.log("⚠️ 기존 STOMP Client가 이미 연결되어 있음.");
        return stompClient;
    }

    console.log(`🟢 새로운 STOMP Client 생성: ${wsUrl}`);
    stompClient = new Client({
        brokerURL: wsUrl,
        connectHeaders: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            user: localStorage.getItem("username"),
        },
        debug: (msg) => console.log("STOMP Debug:", msg),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
        console.log("WebSocket 연결 성공!");

        // 개인 채팅 구독 (로그인한 유저 기준)
        if (userId) {
            console.log(`📩 ${userId} 사용자 채팅 구독 시작: /topic/chat/private/${userId}`);
            stompClient.subscribe(`/topic/chat/private/${userId}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                console.log("📥 [WebSocket] 메시지 수신:", receivedMessage);
                onMessageReceived(receivedMessage);
            });
        }
    };

    stompClient.activate();
    return stompClient;
};

