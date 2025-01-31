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

import java.util.Map;

@RestController
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(JwtTokenProvider jwtTokenProvider, UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;

    }

    // 회원가입
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody @Valid UserRegistrationDTO userDTO) {
        try {
            userService.register(userDTO);
            return ResponseEntity.ok("User registered successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
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
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest loginRequest,
            HttpServletResponse response) {
        return userService.authenticate(loginRequest)
                .map(tokens -> {
                    String accessToken = tokens.getOrDefault("accessToken", "");
                    String refreshToken = tokens.getOrDefault("refreshToken", "");

                    // Access Token을 쿠키에 저장
                    Cookie accessCookie = new Cookie("accessToken", accessToken);
                    accessCookie.setHttpOnly(true); // 보안을 위해 HttpOnly 설정
                    accessCookie.setSecure(false); // HTTPS에서만 전송
                    accessCookie.setPath("/");
                    accessCookie.setMaxAge(3600); // 유효 기간: 1시간
                    response.addCookie(accessCookie);

                    // Refresh Token을 쿠키에 저장
                    Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
                    refreshCookie.setHttpOnly(true);
                    refreshCookie.setSecure(false);
                    refreshCookie.setPath("/");
                    refreshCookie.setMaxAge(86400); // 유효 기간: 1일
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

    // 사용자 정보 조회
    @GetMapping("/api/user")
    public ResponseEntity<Map<String, String>> getMyInfo(Authentication authentication) {
        return userService.getAuthenticatedUserInfo(authentication)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
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

    // 로그아웃
    @PostMapping("/api/user/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        // 쿠키 무효화
        Cookie authCookie = new Cookie("Authorization", null);
        authCookie.setHttpOnly(true);
        authCookie.setSecure(false);
        authCookie.setPath("/");
        authCookie.setMaxAge(0); // 즉시 만료
        response.addCookie(authCookie);

        return ResponseEntity.ok("Logout successful");
    }

}
