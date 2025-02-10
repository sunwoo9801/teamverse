// package org.zerock.teamverse.security;

// import jakarta.servlet.FilterChain;
// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;

// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.GrantedAuthority;
// import org.springframework.security.core.authority.SimpleGrantedAuthority;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.filter.OncePerRequestFilter;

// import io.micrometer.common.lang.NonNull;

// import java.io.IOException;
// import java.util.List;
// import java.util.Map;

// public class JwtTokenFilter extends OncePerRequestFilter {

//     private final JwtTokenProvider jwtTokenProvider;

//     public JwtTokenFilter(JwtTokenProvider jwtTokenProvider) {
//         this.jwtTokenProvider = jwtTokenProvider;
//     }

//     @Override
//     protected void doFilterInternal(@NonNull HttpServletRequest request, HttpServletResponse response,
//             FilterChain filterChain)
//             throws ServletException, IOException {

//         String token = resolveToken(request);
//         System.out.println("📌 요청된 경로: " + request.getRequestURI());
//         System.out.println("📌 Authorization 토큰: " + token);

//         if (token != null && jwtTokenProvider.validateToken(token)) {
//             Map<String, Object> claims = jwtTokenProvider.getClaims(token);
//             String email = (String) claims.get("email");
//             List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + claims.get("role")));

//             UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
//                     email, null, authorities);
//             SecurityContextHolder.getContext().setAuthentication(authentication);
//         } else {
//             System.out.println("Token is invalid or missing.");
//         }

//         filterChain.doFilter(request, response);
//     }

//     private String resolveToken(HttpServletRequest request) {
//         String header = request.getHeader("Authorization");
//         if (header != null && header.startsWith("Bearer ")) {
//             return header.substring(7);
//         }
//         return null;
//     }
// }

package org.zerock.teamverse.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.micrometer.common.lang.NonNull;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

public class JwtTokenFilter extends OncePerRequestFilter {

	private final JwtTokenProvider jwtTokenProvider;

	public JwtTokenFilter(JwtTokenProvider jwtTokenProvider) {
		this.jwtTokenProvider = jwtTokenProvider;
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, HttpServletResponse response,
			FilterChain filterChain) throws ServletException, IOException {

		String token = resolveToken(request);
		System.out.println("📌 요청된 경로: " + request.getRequestURI());
		System.out.println("📌 Authorization 토큰: " + token);

		if (token != null && jwtTokenProvider.validateToken(token)) {
			Map<String, Object> claims = jwtTokenProvider.getClaims(token);
			String email = (String) claims.get("email");
			String role = (String) claims.get("role");

			if (role != null) { // 🔹 role이 존재하는지 확인 후 적용
				List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
				UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
						email, null, authorities);
				SecurityContextHolder.getContext().setAuthentication(authentication);
				System.out.println("✅ 인증된 사용자: " + email);
			} else {
				System.out.println("🚨 유효하지 않은 토큰 - 역할(role) 정보 없음");
			}
		} else {
			System.out.println("🚨 유효하지 않은 토큰 또는 없음");
		}

		filterChain.doFilter(request, response);
	}

	private String resolveToken(HttpServletRequest request) {
		try {
			// 🔹 쿠키에서 토큰 추출
			Cookie[] cookies = request.getCookies();
			if (cookies != null) {
				for (Cookie cookie : cookies) {
					if ("accessToken".equals(cookie.getName())) { // 🔹 쿠키에서 accessToken 찾기
						String token = java.net.URLDecoder.decode(cookie.getValue(), StandardCharsets.UTF_8.name());
						return token.replace("Bearer ", "").trim(); // "Bearer " 제거 및 공백 제거
					}
				}
			}

			// 🔹 헤더에서 토큰 추출
			String header = request.getHeader("Authorization");
			if (header != null && header.startsWith("Bearer ")) {
				return header.substring(7).trim(); // "Bearer " 제거
			}
		} catch (Exception e) {
			System.out.println("❌ 토큰 추출 실패: " + e.getMessage());
		}
		return null; // 🔹 토큰이 없거나 잘못된 경우 null 반환
	}
}