/* 레포지토리 활용해 주요 비즈니스 로직을 캡슐화
 * 예: 사용자 등록, 로그인 인증, 작업 상태 변경 등의 로직 구현
 */

// package org.zerock.teamverse.service;

// // import org.springframework.security.core.userdetails.UsernameNotFoundException;
// import org.springframework.stereotype.Service;
// import org.zerock.teamverse.entity.User;
// import org.zerock.teamverse.repository.UserRepository;

// import jakarta.transaction.Transactional;

// @Service
// public class UserService {
//     private final UserRepository userRepository;

//     public UserService(UserRepository userRepository) {
//         this.userRepository = userRepository;
//     }

//     @Transactional
//     public User registerUser(User user) { 
//         // 사용자 등록 로직 (중복 체크, 비밀번호 암호화 등)
//         return userRepository.save(user);
//     }    
// }

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

    // 사용자 등록 로직
    @Transactional
    public void register(UserRegistrationDTO userDTO) {
        if (userRepository.findByUsername(userDTO.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        User newUser = new User();
        newUser.setUsername(userDTO.getUsername());
        newUser.setEmail(userDTO.getEmail());
        newUser.setPassword(passwordEncoder.encode(userDTO.getPassword())); // 암호화
        newUser.setRole(User.Role.MEMBER); // 기본 역할
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

        String accessToken = jwtTokenProvider.createToken(claims, 10); // 10분 유효
        String refreshToken = jwtTokenProvider.createToken(claims, 60 * 24); // 1일 유효

        return Optional.of(Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken));
    }

    // 인증된 사용자 정보 조회
    public Optional<Map<String, String>> getAuthenticatedUserInfo(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email).map(user -> Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole().name()));
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

    //Refresh Token 검증
    public boolean validateRefreshToken(String refreshToken) {
        return jwtTokenProvider.validateToken(refreshToken);
    }

    
    //Token에서 이메일 추출
    public String getEmailFromToken(String token) {
        return jwtTokenProvider.getEmail(token);
    }

    //새로운 Access Token 생성
    public String generateAccessToken(User user) {
        Map<String, Object> claims = Map.of(
                "email", user.getEmail(),
                "role", user.getRole().name()
        );
        return jwtTokenProvider.createToken(claims, 10); // 10분 유효
    }
    

}
