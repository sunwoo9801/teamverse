/* CORS(Cross-Origin Resource Sharing)를 설정해 
    React 같은 클라이언트가 서버와 통신 */

package org.zerock.teamverse.config;

import java.nio.file.Paths;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer  {

	// CORS 설정을 위한 Bean 등록
	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			
			@Override
			public void addCorsMappings(@NonNull CorsRegistry registry) {
				registry.addMapping("/api/**") // API 요청 경로만 CORS 허용
				.allowedOrigins(
					"http://localhost:3000",
					"https://splendorous-sorbet-72e1b9.netlify.app" // Netlify 프론트엔드 허용
				)				
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH") // 허용할 HTTP 메서드
				.allowedHeaders("*") // 모든 요청 헤더 허용
				.exposedHeaders("Content-Disposition") // 파일 다운로드를 위한 응답 헤더 허용
				.allowCredentials(true); // 쿠키 인증 허용

				
				// ✅ `uploads` 디렉토리의 이미지도 CORS 허용
				registry.addMapping("/uploads/**")
				.allowedOrigins(
					"http://localhost:3000",
					"https://splendorous-sorbet-72e1b9.netlify.app" // Netlify 프론트엔드 허용
				)					.allowedMethods("GET"); // ✅ GET 요청만 허용 (보안 목적)

			}
		};
	}
 @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/storage/uploads/**")
                .addResourceLocations("file:storage/uploads/");
				

        // 정적 리소스 매핑 추가 (업로드된 이미지 제공)
        // registry.addResourceHandler("/uploads/**")
				// .addResourceLocations("file:uploads/"); // 📌 실제 파일 저장 경로
				// .addResourceLocations("file:///C:/uploads/"); // 📌 Windows 경로
				// .addResourceLocations("file:uploads/")  // "uploads/" 폴더를 정적 파일로 제공
				// .setCachePeriod(3600); // 1시간 캐싱

        // Linux 또는 Mac 사용 시 (경로 수정)
        // registry.addResourceHandler("/uploads/**")
        //         .addResourceLocations("file:/home/myapp/uploads/");
    }
	
}
