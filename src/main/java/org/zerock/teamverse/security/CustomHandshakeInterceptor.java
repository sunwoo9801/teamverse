package org.zerock.teamverse.security;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class CustomHandshakeInterceptor implements HandshakeInterceptor {

  @Override
  public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
      WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
    if (request instanceof ServletServerHttpRequest) {
      HttpServletRequest servletRequest = ((ServletServerHttpRequest) request).getServletRequest();
      String authHeader = servletRequest.getHeader("Authorization");
      System.out.println("Received Authorization header: " + authHeader);

      if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);
        System.out.println("Extracted token: " + token);

        // JWT 검증 로직
        if (validateToken(token)) {
          System.out.println("Token validated successfully");
          attributes.put("auth", token);
          return true;
        } else {
          System.out.println("Invalid token");
        }
      } else {
        System.out.println("Missing or invalid Authorization header");
      }
    }
    response.setStatusCode(HttpStatus.FORBIDDEN);
    return false;
  }

  @Override
  public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
      WebSocketHandler wsHandler, Exception ex) {
    // 핸드셰이크 후 추가 작업
  }

  private boolean validateToken(String token) {
    // JWT 검증 로직
    return true; // 예: 검증 성공 시 true 반환
  }
}
