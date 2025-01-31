/* 보안 설정/ JWT 기반 인증 및 접근 제어 설정 */

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
import org.zerock.teamverse.security.JwtTokenFilter;
import org.zerock.teamverse.security.JwtTokenProvider;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfig {
    /*
     * .requestMatchers("/api/users/tasks").hasRole("ADMIN") // 작업 생성은 ADMIN만 가능하도록
     * 설정 가능
     * .oauth2Login(); // OAuth2 인증 추가 시 사용
     */

    // SecurityFilterChain: HTTP 보안 설정을 정의

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtTokenProvider jwtTokenProvider)
            throws Exception {
        http.csrf().disable() // CSRF 비활성화
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // 세션 비활성화
                .and()
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // OPTIONS 요청 허용
                        .requestMatchers("/register", "/login").permitAll() // 인증 없이 접근 가능
                        .requestMatchers("/api/user").authenticated()
                        .anyRequest().authenticated() // 모든 기타 요청은 인증 필요
                )
                .logout(logout -> logout
                        .logoutUrl("/api/users/logout") // 로그아웃 URL
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(HttpServletResponse.SC_OK);
                            response.getWriter().write("Logged out successfully");
                        })
                        .invalidateHttpSession(true) // 세션 무효화
                        .deleteCookies("Authorization") // 쿠키 삭제
                        .permitAll() // 로그아웃 자체는 인증 없이 처리 가능
                )
                .addFilterBefore(new JwtTokenFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class); // JWT
                                                                                                                    // 필터
                                                                                                                    // 추가

        return http.build();
    }

    // PasswordEncoder: 비밀번호 암호화를 위한 BCryptPasswordEncoder를 Bean으로 등록
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // BCrypt 해싱 알고리즘 사용
    }

    // AuthenticationManager: 인증 관리자를 Bean으로 등록 @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
