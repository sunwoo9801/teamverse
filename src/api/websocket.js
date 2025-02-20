import { Client } from "@stomp/stompjs";

let stompClient = null;
let isConnected = false; // ✅ WebSocket 연결 상태 저장'

export const getStompClient = () => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws"; // 🔹 HTTP/HTTPS 환경 감지
    const wsUrl = `${protocol}://localhost:8082/ws`;

    if (stompClient) {
        if (stompClient.connected) {
            console.log("⚠️ 기존 STOMP Client가 이미 연결되어 있음.");
            return stompClient;
        } else {
            console.log("🔄 WebSocket 재연결 시도...");
            stompClient.activate();
            return stompClient;
        }
    }

    console.log(`🟢 새로운 STOMP Client 생성: ${wsUrl}`);
    stompClient = new Client({
        brokerURL: wsUrl,  // ✅ 동적으로 ws/wss 설정
        connectHeaders: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        debug: (msg) => console.log("📌 STOMP Debug:", msg),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
        console.log("✅ WebSocket 연결 성공!");
    };

    stompClient.onStompError = (frame) => {
        console.error("🚨 STOMP 오류 발생:", frame.headers["message"]);
    };

    stompClient.onWebSocketError = (error) => {
        console.error("🚨 WebSocket 연결 오류:", error);
    };

    stompClient.onDisconnect = () => {
        console.warn("⚠️ WebSocket 연결 종료됨!");
    };

    stompClient.activate();
    return stompClient;
};
