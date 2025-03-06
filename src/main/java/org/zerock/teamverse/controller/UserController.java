package org.zerock.teamverse.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.dto.LoginRequest;
import org.zerock.teamverse.dto.LoginResponse;
import org.zerock.teamverse.dto.UserRegistrationDTO;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.security.JwtTokenProvider;
import org.zerock.teamverse.service.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth") // ✅ URL 확인

public class UserController {

	private final UserService userService;
	private final PasswordEncoder passwordEncoder;

	public UserController(JwtTokenProvider jwtTokenProvider, UserService userService, PasswordEncoder passwordEncoder) {
		this.userService = userService;
		this.passwordEncoder = passwordEncoder;

	}

	// 회원가입
	@PostMapping("/register")
	public ResponseEntity<?> registerUser(@RequestBody @Valid UserRegistrationDTO userDTO) {
		try {
			userService.register(userDTO);
			return ResponseEntity.ok("회원가입이 완료되었습니다.");
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}

	// 로그인
	// @PostMapping("/login")
	// public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest
	// loginRequest) {
	// return userService.authenticate(loginRequest)
	// .map(tokens -> {
	// // tokens 값 확인 및 기본값 설정
	// String accessToken = tokens.getOrDefault("accessToken", "");
	// String refreshToken = tokens.getOrDefault("refreshToken", "");
	// return ResponseEntity.ok(new LoginResponse(accessToken, refreshToken));
	// })
	// .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
	// }
	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(
			@RequestBody @Valid LoginRequest loginRequest,
			@RequestParam(name = "rememberMe", defaultValue = "false") boolean rememberMe,
			HttpServletResponse response) {

		// int durationValue = "forever".equals(duration) ? 60 * 60 * 24 * 365 :
		// Integer.parseInt(duration); // ✅ 변환 처리

		return userService.authenticate(loginRequest)
		.map(tokens -> {
				String accessToken = tokens.getOrDefault("accessToken", "");
				String refreshToken = tokens.getOrDefault("refreshToken", ""); // ✅ 항상 refreshToken 발급

					// int refreshTokenExpiry = (durationValue == 30) ? 1800 : 60 * 60 * 24 * 365;
					// // 🔹 30분 또는 영구 유지

					// Access Token을 쿠키에 저장
					Cookie accessCookie = new Cookie("accessToken", accessToken);
					accessCookie.setHttpOnly(true); // 보안을 위해 HttpOnly 설정
					accessCookie.setSecure(false); // HTTPS에서만 전송
					accessCookie.setPath("/");
					// accessCookie.setMaxAge(rememberMe ? 60 * 60 * 24 * 30 : -1); // -1이면 세션 쿠키
					accessCookie.setMaxAge(-1); // ✅ 세션 쿠키 (브라우저 닫으면 삭제)
					response.addCookie(accessCookie);

					// ✅ Refresh Token을 쿠키에 저장 (로그인 유지 옵션이 있을 경우만)

					Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
					refreshCookie.setHttpOnly(true);
					refreshCookie.setSecure(false);
					refreshCookie.setPath("/");
					// refreshCookie.setMaxAge(60 * 60 * 24 * 30); // 30일 유지
					refreshCookie.setMaxAge(rememberMe ? 60 * 60 * 24 * 30 : -1); // ✅ 30일 또는 세션 쿠키
					response.addCookie(refreshCookie);

					return ResponseEntity.ok(new LoginResponse(accessToken, refreshToken));
				})
				.orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
	}

	// 새로운 Access Token 발급
	@PostMapping("/api/user/token/refresh")
	public ResponseEntity<?> refreshAccessToken(@RequestBody Map<String, String> request) {
		String refreshToken = request.getOrDefault("refreshToken", null);

		if (refreshToken == null || refreshToken.isBlank() || !userService.validateRefreshToken(refreshToken)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing refresh token");
		}

		// Refresh Token에서 이메일 추출
		String email = userService.getEmailFromToken(refreshToken);
		if (email == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
		}

		// 이메일을 통해 사용자 확인
		User user = userService.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User not found"));

		// 새로운 Access Token 생성
		String newAccessToken = userService.generateAccessToken(user);

		return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
	}

	// ✅ 사용자 정보 조회 (경로를 명확히 /api/auth/me로 변경)
	// @GetMapping("/me")
	// public ResponseEntity<Map<String, String>> getMyInfo(Authentication
	// authentication) {
	// return userService.getAuthenticatedUserInfo(authentication)
	// .map(ResponseEntity::ok)
	// .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
	// }
	@GetMapping("/me")
	public ResponseEntity<Map<String, Object>> getMyInfo(Authentication authentication) {
		if (authentication == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
		}

		String email = authentication.getName();
		User user = userService.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User not found"));

		Map<String, Object> response = new HashMap<>();
		response.put("id", user.getId()); // ✅ id 필드 추가
		response.put("email", user.getEmail());
		response.put("role", user.getRole().name());
		response.put("username", user.getUsername());

		return ResponseEntity.ok(response);
	}

	// 사용자 정보 수정
	@PutMapping("/api/user")
	public ResponseEntity<?> updateUserInfo(@RequestBody Map<String, String> updates, Authentication authentication) {
		String email = authentication.getName(); // 현재 사용자 이메일 가져오기
		User user = userService.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User not found"));

		// username 변경
		if (updates.containsKey("username") && updates.get("username") != null) {
			user.setUsername(updates.get("username"));
		}

		// email 변경
		if (updates.containsKey("email") && updates.get("email") != null) {
			if (userService.existsByEmail(updates.get("email"))) {
				return ResponseEntity.badRequest().body("Email already in use");
			}
			user.setEmail(updates.get("email"));
		}

		// password 변경 (암호화)
		if (updates.containsKey("password") && updates.get("password") != null) {
			user.setPassword(passwordEncoder.encode(updates.get("password")));
		}

		userService.saveUser(user); // 변경된 사용자 저장
		return ResponseEntity.ok("User information updated successfully");
	}

	// 사용자 삭제
	@DeleteMapping("/api/user")
	public ResponseEntity<String> deleteMyAccount(Authentication authentication) {
		if (userService.deleteAuthenticatedUser(authentication)) {
			return ResponseEntity.ok("User account deleted successfully");
		}
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
	}

	// ✅ 로그아웃 (쿠키 삭제)
	@PostMapping("/logout")
	public ResponseEntity<String> logout(HttpServletResponse response) {
		// ✅ 클라이언트 쿠키 삭제 요청 (accessToken, refreshToken 제거)
		// 🔹 Access Token 쿠키 삭제
		Cookie accessCookie = new Cookie("accessToken", null);
		accessCookie.setHttpOnly(true);
		accessCookie.setSecure(false); // 🔹 개발 환경에서는 false, 배포 시 true로 변경 필요
		accessCookie.setPath("/");
		accessCookie.setMaxAge(0); // ✅ 즉시 만료
		response.addCookie(accessCookie);

		// 🔹 Refresh Token 쿠키 삭제
		Cookie refreshCookie = new Cookie("refreshToken", null);
		refreshCookie.setHttpOnly(true);
		refreshCookie.setSecure(false);
		refreshCookie.setPath("/");
		refreshCookie.setMaxAge(0); // ✅ 즉시 만료
		response.addCookie(refreshCookie);

		System.out.println("✅ 로그아웃: accessToken 및 refreshToken 쿠키 삭제됨."); // ✅ 로그 추가

		return ResponseEntity.ok("로그아웃 성공");
	}

}