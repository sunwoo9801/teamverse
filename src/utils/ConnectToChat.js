import { Client } from "@stomp/stompjs"; // ✅ 올바른 임포트
import axios from "axios";
import { getAccessTokenFromCookie } from "./utils"; // ✅ 쿠키에서 Access Token 가져오기

const connectToChat = async (stompClient, setStompClient) => { // ✅ 수정됨: stompClient 상태를 관리하는 매개변수 추가
  try {
    // ✅ 수정됨: accessToken을 쿠키에서 가져오기
    const accessToken = getAccessTokenFromCookie();
    if (!accessToken) {
      console.error("⛔ Access Token 없음, WebSocket 연결 중단");
      return;
    }

    console.log("🔍 현재 Access Token:", accessToken);

    // ✅ Secondary Token 요청 (Authorization 헤더 추가됨)
    const response = await axios.post(
      "http://localhost:8082/api/user/secondary-token",
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` }, // ✅ 수정됨: Authorization 헤더 추가
        withCredentials: true,
      }
    );

    const secondaryToken = response.data.secondaryToken;
    console.log("✅ Secondary Token:", secondaryToken);

    // URL 인코딩된 토큰 사용
    const encodedToken = encodeURIComponent(secondaryToken);
    const wsUrl = `ws://localhost:8082/ws?secondaryToken=${encodeURIComponent(secondaryToken)}`;
    console.log("🌐 WebSocket 연결 URL:", wsUrl);

    // ✅ 기존 WebSocket 연결이 있다면 종료 (중복 연결 방지)
    if (stompClient) {
      console.log("🔴 기존 WebSocket 연결 종료");
      stompClient.deactivate();
    }

    // WebSocket 클라이언트 생성 시 wsUrl 사용
    const client = new Client({
      brokerURL: wsUrl,  // 여기서 인코딩된 URL 사용!
      reconnectDelay: 5000,
      onConnect: (frame) => {
        console.log("🟢 WebSocket 연결 성공:", frame);
        client.subscribe("/topic/chat/1", (message) => {
          console.log("📩 수신된 메시지:", JSON.parse(message.body));
        });
        client.publish({
          destination: "/app/chat/send",
          headers: {},
          body: JSON.stringify({
            content: "Hello Team!",
            teamId: 1,
          }),
        });
      },
      onStompError: (frame) => {
        console.error("⛔ WebSocket 연결 실패:", frame);
        console.warn("🔁 5초 후 WebSocket 자동 재연결 시도...");
        setTimeout(() => connectToChat(stompClient, setStompClient), 5000);
      },
    });

    client.activate();
    setStompClient(client);

  } catch (error) {
    console.error("❌ Secondary Token 요청 실패:", error);
  }
};

export default connectToChat;
