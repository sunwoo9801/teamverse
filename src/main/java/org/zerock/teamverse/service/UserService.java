package org.zerock.teamverse.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.zerock.teamverse.dto.LoginRequest;
import org.zerock.teamverse.dto.UserRegistrationDTO;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.UserRepository;
import org.zerock.teamverse.security.JwtTokenProvider;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // ✅ ID로 사용자 조회
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // 사용자 등록 로직
    @Transactional
    public void register(UserRegistrationDTO userDTO) {
        // 🔹 사용자명이 중복되는지 확인
        if (userRepository.findByUsername(userDTO.getUsername()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 사용자명입니다.");
        }

        // 🔹 이메일이 중복되는지 확인
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 🔹 사용자 저장
        User newUser = new User();
        newUser.setUsername(userDTO.getUsername());
        newUser.setEmail(userDTO.getEmail());
        newUser.setPassword(passwordEncoder.encode(userDTO.getPassword())); // 비밀번호 암호화
        newUser.setRole(User.Role.MEMBER); // 기본 역할 설정

        // ✅ 선택 입력 필드 (값이 있으면 저장, 없으면 null 유지)
        if (userDTO.getCompanyName() != null) {
            newUser.setCompanyName(userDTO.getCompanyName());
        }
        if (userDTO.getDepartment() != null) {
            newUser.setDepartment(userDTO.getDepartment());
        }
        if (userDTO.getPosition() != null) {
            newUser.setPosition(userDTO.getPosition());
        }
        if (userDTO.getPhoneNumber() != null) {
            newUser.setPhoneNumber(userDTO.getPhoneNumber());
        }

        userRepository.save(newUser);
    }

    // 사용자 인증 로직
    public Optional<Map<String, String>> authenticate(LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        if (userOptional.isEmpty()
                || !passwordEncoder.matches(loginRequest.getPassword(), userOptional.get().getPassword())) {
            return Optional.empty();
        }

        User user = userOptional.get();
        Map<String, Object> claims = Map.of(
                "email", user.getEmail(),
                "role", user.getRole().name());

        String accessToken = jwtTokenProvider.createToken(claims, 60); // 10분 유효
        String refreshToken = jwtTokenProvider.createToken(claims, 60 * 24 * 30); // 1일 유효

        return Optional.of(Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken));
    }

    // 인증된 사용자 정보 조회
    public Optional<Map<String, Object>> getAuthenticatedUserInfo(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email).map(user -> Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "companyName", user.getCompanyName(),
                "department", user.getDepartment(),
                "position", user.getPosition(),
                "phoneNumber", user.getPhoneNumber()));
    }

    // 사용자 이메일로 조회
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // 이메일 중복 체크
    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    // 사용자 저장
    public void saveUser(User user) {
        userRepository.save(user);
    }

     // ✅ 사용자 정보 업데이트 기능 추가
     @Transactional
     public void updateUser(User user, Map<String, String> updates) {
         if (updates.containsKey("companyName")) user.setCompanyName(updates.get("companyName"));
         if (updates.containsKey("department")) user.setDepartment(updates.get("department"));
         if (updates.containsKey("position")) user.setPosition(updates.get("position"));
         if (updates.containsKey("phoneNumber")) user.setPhoneNumber(updates.get("phoneNumber"));
 
         userRepository.save(user);
     }

    // 사용자 삭제
    @Transactional
    public boolean deleteAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String email = authentication.getName();
        Optional<User> userOptional = userRepository.findByEmail(email);
        userOptional.ifPresent(userRepository::delete);
        return userOptional.isPresent();
    }

    // 로그아웃
    public void logout(HttpServletResponse response) {
        Cookie authCookie = new Cookie("Authorization", null);
        authCookie.setHttpOnly(true);
        authCookie.setSecure(true);
        authCookie.setPath("/");
        authCookie.setMaxAge(0); // 즉시 만료
        response.addCookie(authCookie);
    }

    // Refresh Token 검증
    public boolean validateRefreshToken(String refreshToken) {
        return jwtTokenProvider.validateToken(refreshToken);
    }

    // Token에서 이메일 추출
    public String getEmailFromToken(String token) {
        return jwtTokenProvider.getEmail(token);
    }

    // 새로운 Access Token 생성
    public String generateAccessToken(User user) {
        Map<String, Object> claims = Map.of(
                "email", user.getEmail(),
                "role", user.getRole().name());
        return jwtTokenProvider.createToken(claims, 10); // 10분 유효
    }

}
