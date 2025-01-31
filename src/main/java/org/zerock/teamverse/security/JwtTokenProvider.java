package org.zerock.teamverse.security;

import io.jsonwebtoken.*; // JWT 생성 및 검증 관련 클래스
import io.jsonwebtoken.security.Keys; // 비밀키 생성 유틸리티
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component // Spring에서 Bean으로 관리
public class JwtTokenProvider {

  private final Key secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256); // JWT 암호화를 위한 비밀키 생성
  private final long validityInMilliseconds = 3600000; // 토큰 유효 기간: 1시간

  /**
   * 기존 방식: 이메일(subject)과 역할(role)을 사용해 토큰 생성.
   */
  // JWT 토큰 생성 메서드
  public String createToken(String email, String role) {
    if (email == null || email.isEmpty() || role == null || role.isEmpty()) {
      throw new IllegalArgumentException("Email or role cannot be null or empty");
    }
    Claims claims = Jwts.claims().setSubject(email);
    claims.put("role", role);

    Date now = new Date();
    Date validity = new Date(now.getTime() + validityInMilliseconds);

    return Jwts.builder()
        .setClaims(claims)
        .setIssuedAt(now)
        .setExpiration(validity)
        .signWith(secretKey, SignatureAlgorithm.HS256)
        .compact();
  }

  /**
   * 새로운 방식: 클레임(Map 형식)과 유효 기간(minutes)을 사용해 토큰 생성.
   */
  public String createToken(Map<String, Object> claims, int minutes) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + minutes * 60 * 1000); // 유효 시간 설정

    return Jwts.builder()
        .setClaims(claims) // Map 데이터를 그대로 클레임으로 설정
        .setIssuedAt(now) // 현재 시간
        .setExpiration(expiryDate) // 유효 시간
        .signWith(secretKey, SignatureAlgorithm.HS256) // 비밀키로 서명
        .compact();
  }

  public String getRole(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(secretKey)
        .build()
        .parseClaimsJws(token)
        .getBody()
        .get("role", String.class); // "role" 클레임에서 역할 가져오기
  }

  // 토큰 검증
  public boolean validateToken(String token) {
    try {
        Jwts.parserBuilder()
            .setSigningKey(secretKey) // 비밀키 사용
            .build()
            .parseClaimsJws(token);  // 토큰 검증
        return true;
    } catch (ExpiredJwtException e) {
        System.out.println("Token expired: " + e.getMessage());
    } catch (JwtException e) {
        System.out.println("Token is invalid: " + e.getMessage());
    } catch (IllegalArgumentException e) {
        System.out.println("Invalid token argument: " + e.getMessage());
    }
    return false; // 검증 실패 시 false 반환
}

public String getEmail(String token) {
  try {
      return Jwts.parserBuilder()
          .setSigningKey(secretKey)
          .build()
          .parseClaimsJws(token)
          .getBody()
          .getSubject();
  } catch (JwtException | IllegalArgumentException e) {
      System.out.println("Failed to parse token for email: " + e.getMessage());
      return null;
  }
}

  // 클레임 추출
  public Map<String, Object> getClaims(String token) {
    try {
        return Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .getBody();
    } catch (Exception e) {
        System.out.println("Failed to extract claims: " + e.getMessage());
        return null;
    }
}


}
