# 1️⃣ Java 17을 기반으로 하는 슬림 버전 OpenJDK 사용
FROM openjdk:17-jdk-slim AS build

# 2️⃣ 작업 디렉토리 설정
WORKDIR /app

# 3️⃣ 프로젝트의 모든 소스코드를 컨테이너로 복사
COPY . .

# 4️⃣ Gradle 빌드 실행 (JAR 파일 생성) - 테스트 제외!
RUN ./gradlew build --no-daemon -x test

# 5️⃣ 실행 환경 설정
FROM openjdk:17-jdk-slim

WORKDIR /app

# 6️⃣ 빌드된 JAR 파일을 복사
COPY --from=build /app/build/libs/teamverse-0.0.1-SNAPSHOT.jar app.jar

# 7️⃣ 컨테이너에서 사용할 포트 설정
EXPOSE 8080

# 8️⃣ Spring Boot 애플리케이션 실행
CMD ["java", "-jar", "app.jar"]
