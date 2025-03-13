package org.zerock.teamverse.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.zerock.teamverse.security.JwtTokenFilter;
import org.zerock.teamverse.security.JwtTokenProvider;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtTokenProvider jwtTokenProvider)
            throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS 설정 활성화
                .csrf().disable()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/chat/private/save").authenticated() // 메시지 저장은 인증 필요
                        .requestMatchers("/uploads/**").permitAll() // 정적 파일 접근 허용
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // OPTIONS 요청 허용
                        .requestMatchers("/api/auth/register").permitAll() // 회원가입 허용
                        .requestMatchers("/api/auth/login").permitAll() // 로그인 허용
                        .requestMatchers("/ws/**").permitAll() // WebSocket 요청 허용
                        .requestMatchers("/topic/**").permitAll() // STOMP 메시지 브로커 허용
                        .requestMatchers("/app/**").permitAll() // STOMP 메시지 브로커 허용
                        .requestMatchers("/user/**").permitAll() // 개인 메시지 전송 허용
                        .requestMatchers("/payment/complete").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/activity/post").authenticated()
                        .requestMatchers("/api/auth/logout").authenticated()
                        .requestMatchers("/api/team/invite").authenticated()
                        .requestMatchers("/api/user/projects/**").authenticated()
                        .requestMatchers("/api/config/google-maps-key").authenticated()
                        .requestMatchers("/api/places/search").authenticated()
                        .requestMatchers("/api/user").authenticated()
                        .requestMatchers("/api/auth").authenticated()
                        .requestMatchers("/api/auth/**").permitAll() // 인증 없이 접근 가능
                        .requestMatchers("/api/user/tasks/**").authenticated()
                        .requestMatchers("/api/likes/**").authenticated()
                        .requestMatchers("/api/likes/toggle").authenticated() // 인증 필요
                        .requestMatchers("/api/files/**").authenticated()
                        .requestMatchers("/api/files/project/{projectId}").authenticated()
                        .requestMatchers("/api/files/download").authenticated()
                        .requestMatchers("/api/files/upload").authenticated() // 파일 업로드는 인증 필요
                        .requestMatchers("/api/activity/feed/**").authenticated() // 피드 조회는 인증된 사용자만 가능
                        .requestMatchers("/api/activity/feed/{projectId}").authenticated() // 피드 조회는 인증된 사용자만 가능
                        .requestMatchers("/api/comments/**").authenticated()  // 🔹 댓글 API는 인증된 사용자만 접근 가능
                        .requestMatchers(HttpMethod.PATCH, "/api/comments/**").authenticated() // 🔹 PATCH 요청 허용
                        .requestMatchers(HttpMethod.POST, "/api/chat/private/send").hasAnyRole("USER", "MEMBER") // 사용자
                                                                                                                 // 역할
                                                                                                                 // 필요
                        .requestMatchers("/api/chat/private/**").authenticated() // 개인 메시지 API 보호
                        .requestMatchers("/uploads/**").permitAll() // ✅ 파일 다운로드는 인증 없이 허용

                        .anyRequest().authenticated())
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            System.out.println(" [SecurityConfig] 인증 실패: " + request.getRequestURI());
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        }))
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(HttpServletResponse.SC_OK);
                            response.getWriter().write("Logged out successfully");
                        })
                        .invalidateHttpSession(true)
                        .deleteCookies("accessToken", "refreshToken")
                        .permitAll())
                .addFilterBefore(new JwtTokenFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS 설정을 Spring Security에서 직접 적용
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // configuration.setAllowedOriginPatterns(List.of("*")); // 모든 출처 허용
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // React 프론트엔드만 허용
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition")); // 클라이언트가 Authorization 헤더
        configuration.setAllowCredentials(true); // JWT 포함 요청 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    // PasswordEncoder 설정
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager 설정
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

}