// package org.zerock.teamverse.security;

// import jakarta.servlet.FilterChain;
// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.Cookie;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;

// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.GrantedAuthority;
// import org.springframework.security.core.authority.SimpleGrantedAuthority;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.filter.OncePerRequestFilter;

// import java.io.IOException;
// import java.nio.charset.StandardCharsets;
// import java.util.Collections;
// import java.util.List;

// public class JwtTokenFilter extends OncePerRequestFilter {

//   private final JwtTokenProvider jwtTokenProvider;

//   public JwtTokenFilter(JwtTokenProvider jwtTokenProvider) {
//     this.jwtTokenProvider = jwtTokenProvider;
//   }

//   @Override
//   protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
//       throws ServletException, IOException {
//     String token = resolveToken(request); // 요청 헤더에서 JWT 토큰 추출

//     if (token != null && jwtTokenProvider.validateToken(token)) { // 토큰 검증
//       String email = jwtTokenProvider.getEmail(token); // 토큰에서 사용자 이메일 추출
//       String role = jwtTokenProvider.getRole(token); // 토큰에서 사용자 역할 추출
//       System.out.println("Token is valid. Email: " + email + ", Role: " + role); //오류 잡으면 삭제 가능

//       // 권한 설정
//       List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(role));
//       UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(email, null,
//           authorities);
//       SecurityContextHolder.getContext().setAuthentication(authentication);
//     } else {
//       System.out.println("Token is invalid or missing.");
//     }
//     filterChain.doFilter(request, response); // 다음 필터로 요청 전달
//   }

//   private String resolveToken(HttpServletRequest request) {
//     try {
//         // 쿠키에서 토큰 추출
//         Cookie[] cookies = request.getCookies();
//         if (cookies != null) {
//             for (Cookie cookie : cookies) {
//                 if ("Authorization".equals(cookie.getName())) {
//                     String token = java.net.URLDecoder.decode(cookie.getValue(), StandardCharsets.UTF_8.name());
//                     return token.replace("Bearer ", "").trim(); // "Bearer " 제거 및 공백 제거
//                 }
//             }
//         }

//         // 헤더에서 토큰 추출
//         String header = request.getHeader("Authorization");
//         if (header != null && header.startsWith("Bearer ")) {
//             return header.substring(7).trim(); // "Bearer " 제거
//         }
//     } catch (Exception e) {
//         System.out.println("Failed to resolve token: " + e.getMessage());
//     }
//     return null; // 토큰이 없거나 잘못된 경우 null 반환
// }

// }

package org.zerock.teamverse.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.micrometer.common.lang.NonNull;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public class JwtTokenFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtTokenFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {
        String token = resolveToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            Map<String, Object> claims = jwtTokenProvider.getClaims(token);
            String email = (String) claims.get("email");
            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + claims.get("role")));

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    email, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } else {
            System.out.println("Token is invalid or missing.");
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
