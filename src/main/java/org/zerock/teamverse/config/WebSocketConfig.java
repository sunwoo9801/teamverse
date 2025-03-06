package org.zerock.teamverse.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.converter.MessageConverter;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
          .setAllowedOriginPatterns("*") // ✅ 모든 도메인 허용
          .setHandshakeHandler(new DefaultHandshakeHandler()
                               {
                                   @Override
                                   protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
                                       // ✅ 클라이언트에서 "user"라는 속성으로 username을 전송한다고 가정
                                       return () -> (String) attributes.get("user");
                                   }
                               }

          ); // ✅ 핸드셰이크 문제 해결
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*");
        registry.addEndpoint("/ws-chat").setAllowedOrigins("*").withSockJS(); // ✅ 웹소켓 연결 (SockJS 지원)
        registry.addEndpoint("/ws/chat") // ✅ 엔드포인트 등록
          .setAllowedOrigins("*")   // ✅ CORS 설정
          .withSockJS();           // ✅ SockJS 지원

    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue"); // ✅ 구독 채널 설정
        registry.setApplicationDestinationPrefixes("/app"); // ✅ 클라이언트가 메시지를 보낼 경로
        registry.setUserDestinationPrefix("/user"); // ✅ 사용자별 메시지 경로 설정

    }

    // ✅ WebSocket 메시지를 JSON으로 변환하는 컨버터 추가
    @Override
    public boolean configureMessageConverters(List<MessageConverter> converters) {
        converters.add(new MappingJackson2MessageConverter()); // ✅ Jackson JSON 변환기 추가
        return false;
    }

}
