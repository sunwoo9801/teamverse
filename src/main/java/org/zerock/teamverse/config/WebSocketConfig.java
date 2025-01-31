package org.zerock.teamverse.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.zerock.teamverse.security.CustomHandshakeInterceptor;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // WebSocket 연결 엔드포인트 설정
    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") // 클라이언트가 연결할 WebSocket 엔드포인트
                /*
                 * 현재: 모든 도메인 허용 (CORS 설정)
                 * 배포 시: 특정 도메인만 허용하도록 변경 필요
                 * (예:.setAllowedOrigins("https://mydomain.com"))
                 */
                .setAllowedOrigins("*")
                .addInterceptors(new CustomHandshakeInterceptor()) // 커스텀 핸드셰이크 인터셉터 추가(연결을 판단해주는 문지기 역할)
                .withSockJS(); // SockJS를 사용해 WebSocket을 지원하지 않는 환경에서도 작동
        System.out.println("WebSocket endpoint registered at /ws"); // 디버그 메시지, 디버그 해결시 삭제 가능
    }

    // 메시지 브로커 설정
    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {// 라우팅 설정정
        registry.enableSimpleBroker("/topic"); // 메시지 브로커가 구독할 주제(prefix)
        registry.setApplicationDestinationPrefixes("/app"); // 클라이언트가 메시지를 보낼 때 사용할 prefix
    }
    /*
     * WebSocket이 뭐야?
     * 
     * WebSocket은 전화기라고 생각하면 돼.
     * HTTP 요청은 "문자 보내기"처럼 한 번 보내면 끝이지만,
     * WebSocket은 "전화 통화"처럼 연결을 계속 유지하면서 양방향으로 주고받을 수 있어.
     * "/ws"는 뭐야?
     * 
     * "/ws"는 서버 전화기의 "전화번호"야.
     * 클라이언트(React 같은)가 "연결해줘!" 하고 이 번호로 전화를 거는 거지.
     * "/topic"은 뭐야?
     * 
     * "/topic"은 "단톡방"이라고 생각하면 돼.
     * 누가 메시지를 보내면, 방에 있는 모든 사람이 그 메시지를 받는 거야.
     * "/app"은 뭐야?
     * 
     * "/app"은 "서버가 들을 전화기"라고 생각하면 돼.
     * 클라이언트가 "/app/작업"으로 메시지를 보내면, 서버가 그 작업을 처리하는 거지.
     */
}
