package org.zerock.teamverse.config;

import org.springframework.security.config.annotation.SecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.zerock.teamverse.security.JwtTokenFilter;
import org.zerock.teamverse.security.JwtTokenProvider;

/**
 * JwtConfigurer 클래스는 Spring Security에 JWT 인증을 추가하기 위한 설정을 제공하는 클래스입니다.
 */
public class JwtConfigurer extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {

    // JWT 토큰 생성을 처리하는 JwtTokenProvider 인스턴스
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * JwtConfigurer 생성자 - JwtTokenProvider를 초기화합니다.
     * @param jwtTokenProvider JWT 토큰 생성 및 검증을 담당하는 클래스
     */
    public JwtConfigurer(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * HttpSecurity에 JwtTokenFilter를 추가하여 요청 필터링 로직을 구성합니다.
     * @param http 보안 설정을 관리하는 HttpSecurity 객체
     * @throws Exception 설정 중 오류가 발생할 수 있음
     */
    @Override
    public void configure(HttpSecurity http) throws Exception {
        JwtTokenFilter customFilter = new JwtTokenFilter(jwtTokenProvider); // JWT 필터 생성
        http.addFilterBefore(customFilter, UsernamePasswordAuthenticationFilter.class); // 필터 체인에 추가
    }
}
