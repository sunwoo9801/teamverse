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
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtTokenProvider jwtTokenProvider) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ CORS 설정 활성화
            .csrf().disable()

            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // ✅ OPTIONS 요청 허용
                    .requestMatchers("/api/auth/register", "/api/auth/login").permitAll() // ✅ 로그인 및 회원가입 허용
                    .requestMatchers("/api/auth/logout").authenticated()
                    .requestMatchers("/api/team/invite").authenticated()  
                    .requestMatchers("/api/user/projects/**").authenticated() 
                    .requestMatchers("/api/user").authenticated() // ✅ 인증된 사용자만 /api/user 접근 가능
                    .requestMatchers("/ws/**").permitAll() // ✅ WebSocket 요청 허용
                    .requestMatchers("/topic/**").permitAll() // ✅ STOMP 메시지 브로커 허용
                    .requestMatchers("/app/**").permitAll() // ✅ STOMP 메시지 브로커 허용
                    .requestMatchers("/user/**").permitAll() // ✅ 개인 메시지 전송 허용
                    

                    
                    .anyRequest().authenticated()
            )
            
            .exceptionHandling(exception -> exception
                    .authenticationEntryPoint((request, response, authException) -> {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                    })
            )
            .logout(logout -> logout
                    .logoutUrl("/api/auth/logout")
                    .logoutSuccessHandler((request, response, authentication) -> {
                        response.setStatus(HttpServletResponse.SC_OK);
                        response.getWriter().write("Logged out successfully");
                    })
                    .invalidateHttpSession(true)
                    .deleteCookies("accessToken", "refreshToken")
                    .permitAll()
            )
            .addFilterBefore(new JwtTokenFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);
    
        return http.build();
    }
    

    // ✅ CORS 설정을 Spring Security에서 직접 적용
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*")); // 모든 출처 허용
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization")); // ✅ 클라이언트가 Authorization 헤더 접근 가능
        configuration.setAllowCredentials(true); // ✅ JWT 포함 요청 허용
    
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        configuration.setAllowedOriginPatterns(List.of("http://localhost:3000")); // 특정 도메인 지정

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
