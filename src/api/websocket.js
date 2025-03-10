//import { Client } from "@stomp/stompjs";
//
//let stompClient = null;
//
//export const getStompClient = () => {
//    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//    const wsUrl = `${protocol}://localhost:8082/ws`;
//
//    if (stompClient && stompClient.connected) {
//        console.log("⚠️ 기존 STOMP Client가 이미 연결되어 있음.");
//        return stompClient;
//    }
//
//    console.log(`🟢 새로운 STOMP Client 생성: ${wsUrl}`);
//    stompClient = new Client({
//        brokerURL: wsUrl,
//        connectHeaders: {
//            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//        },
//        debug: (msg) => console.log("STOMP Debug:", msg),
//        reconnectDelay: 5000,
//        heartbeatIncoming: 4000,
//        heartbeatOutgoing: 4000,
//    });
//
//    stompClient.onConnect = () => {
//        console.log("WebSocket 연결 성공!");
//
//        // 초대 알림 구독 추가
//        stompClient.subscribe("/topic/invites", (message) => {
//            console.log("📩 새 초대 알림 수신:", JSON.parse(message.body));
//            alert("새로운 초대가 도착했습니다!"); // 알림 추가
//        });
//    };
//
//    stompClient.onStompError = (frame) => {
//        console.error("🚨 STOMP 오류 발생:", frame.headers["message"]);
//    };
//
//    stompClient.onWebSocketError = (error) => {
//        console.error("🚨 WebSocket 연결 오류:", error);
//    };
//
//    stompClient.onDisconnect = () => {
//        console.warn("⚠️ WebSocket 연결 종료됨! 재연결 시도...");
//        setTimeout(() => stompClient.activate(), 5000);
//    };
//
//    stompClient.activate();
//    return stompClient;
//};











// import { Client } from "@stomp/stompjs";

// let stompClient = null;
// let reconnectAttempts = 0; // 재연결 횟수 추적

// export const getStompClient = () => {
//     const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//     const wsUrl = `${protocol}://localhost:8082/ws`;

//     if (stompClient && stompClient.connected) {
//         console.log("⚠️ 기존 STOMP Client가 이미 연결되어 있음.");
//         return stompClient;
//     }

//     console.log(` 새로운 STOMP Client 생성: ${wsUrl}`);
//     stompClient = new Client({
//         brokerURL: wsUrl,
//         connectHeaders: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//         },
//         debug: (msg) => console.log("STOMP Debug:", msg),
//         reconnectDelay: 5000, // 5초마다 재연결 시도
//         heartbeatIncoming: 4000,
//         heartbeatOutgoing: 4000,
//     });

//     stompClient.onConnect = () => {
//         console.log("WebSocket 연결 성공!");
//         reconnectAttempts = 0; // 재연결 횟수 초기화
//     };

//     stompClient.onStompError = (frame) => {
//         console.error("🚨 STOMP 오류 발생:", frame.headers["message"]);
//     };

//     stompClient.onWebSocketError = (error) => {
//         console.error("🚨 WebSocket 연결 오류:", error);
//     };

//     stompClient.onDisconnect = () => {
//         console.warn(`⚠️ WebSocket 연결 종료됨! 재연결 시도: ${reconnectAttempts}`);
//         if (reconnectAttempts < 5) {
//             reconnectAttempts++;
//             setTimeout(() => stompClient.activate(), 5000);
//         } else {
//             console.error("🚨 WebSocket 연결 5회 실패, 수동 새로고침 필요!");
//         }
//     };

//     stompClient.activate();
//     return stompClient;
// };
// import { Client } from "@stomp/stompjs";

// let stompClient = null;

// export const getStompClient = () => {
//     const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//     const wsUrl = `${protocol}://localhost:8082/ws`;

//     if (stompClient && stompClient.connected) {
//         console.log("⚠️ 기존 STOMP Client가 이미 연결되어 있음.");
//         return stompClient;
//     }

//     console.log(`🟢 새로운 STOMP Client 생성: ${wsUrl}`);
//     stompClient = new Client({
//         brokerURL: wsUrl,
//         connectHeaders: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//             user: localStorage.getItem("username"), // WebSocket 연결 시 username 전달

//         },
//         debug: (msg) => console.log("STOMP Debug:", msg),
//         reconnectDelay: 5000,
//         heartbeatIncoming: 4000,
//         heartbeatOutgoing: 4000,
//     });



//     stompClient.onConnect = () => {
//         console.log("WebSocket 연결 성공!");

//         // 초대 알림 구독 추가
//         stompClient.subscribe("/topic/invites", (message) => {
//             console.log("📩 새 초대 알림 수신:", JSON.parse(message.body));
//             alert("새로운 초대가 도착했습니다!"); // 알림 추가
//         });

//     };

//     stompClient.onStompError = (frame) => {
//         console.error("🚨 STOMP 오류 발생:", frame.headers["message"]);
//     };

//     stompClient.onWebSocketError = (error) => {
//         console.error("🚨 WebSocket 연결 오류:", error);
//     };

//     stompClient.onDisconnect = () => {
//         console.warn("⚠️ WebSocket 연결 종료됨! 재연결 시도...");
//         setTimeout(() => stompClient.activate(), 5000);
//     };

//     stompClient.activate();
//     return stompClient;
// };
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const getStompClient = (userId, onMessageReceived) => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://localhost:8082/ws`;

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

