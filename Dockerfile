# 사용 가능한 가벼운 OpenJDK 17 이미지 사용
FROM openjdk:17-jdk-slim

# 작업 디렉토리 설정
WORKDIR /app

# JAR 파일 복사 (JAR 파일명을 맞춰야 함!)
COPY build/libs/teamverse-0.0.1-SNAPSHOT.jar app.jar

# 실행 포트 설정
EXPOSE 8082

# Spring Boot 실행
CMD ["java", "-jar", "app.jar"]
