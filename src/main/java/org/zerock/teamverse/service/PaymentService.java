package org.zerock.teamverse.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;

@Service
public class PaymentService {

    // ✅ 환경 변수에서 API 키 가져오기
    @Value("${PORTONE_API_KEY}")
    private String PORTONE_API_KEY;

    @Value("${PORTONE_SECRET}")
    private String PORTONE_SECRET;
    
    // private String PORTONE_SECRET="5155004741204347";
    // private String PORTONE_API_KEY="DUtUwx3ANXwCTNsJCRWJaO4ZX7PhHClz5TREeb5IRSv3R6OQCMLuuN1tOvVP4PxKwKQT3EAIqRQoHqW9";

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * ✅ 포트원(PortOne) API 인증 토큰 발급
     */
    public String getPortOneAccessToken() {
        try {
            System.out.println("📌 API Key 확인: " + PORTONE_API_KEY);
            System.out.println("📌 Secret Key 확인: " + PORTONE_SECRET);
    
            if (PORTONE_API_KEY == null || PORTONE_SECRET == null || PORTONE_API_KEY.isEmpty() || PORTONE_SECRET.isEmpty()) {
                System.out.println("❌ API Key 또는 Secret Key가 설정되지 않았습니다!");
                return null;
            }
    
            // ✅ API 요청 URL
            String tokenUrl = "https://api.iamport.kr/users/getToken";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
    
            // ✅ 요청 데이터 형식을 HashMap -> JSON String으로 변환
            HashMap<String, String> requestBody = new HashMap<>();
            requestBody.put("imp_key", PORTONE_API_KEY);
            requestBody.put("imp_secret", PORTONE_SECRET);
    
            ObjectMapper objectMapper = new ObjectMapper();
            String requestBodyJson = objectMapper.writeValueAsString(requestBody);
    
            HttpEntity<String> entity = new HttpEntity<>(requestBodyJson, headers);
            ResponseEntity<Map> response = restTemplate.exchange(tokenUrl, HttpMethod.POST, entity, Map.class);
    
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                System.out.println("❌ 포트원 API 인증 요청 실패: " + response.getStatusCode());
                return null;
            }
    
            Map<String, Object> responseData = response.getBody();
            Map<String, Object> tokenData = (Map<String, Object>) responseData.get("response");
    
            return tokenData != null ? (String) tokenData.get("access_token") : null;
        } catch (Exception e) {
            System.out.println("❌ 포트원 API 토큰 요청 중 오류 발생: " + e.getMessage());
            return null;
        }
    }
    

    /**
     * ✅ 결제 검증 수행
     * @param impUid 결제 고유 번호
     * @param merchantUid 주문번호
     * @param expectedAmount 실제 주문 금액 (DB에서 조회 필요)
     * @return 결제 검증 성공 여부
     */
    public boolean verifyPayment(String impUid, String merchantUid, double expectedAmount) {
        try {
            // ✅ 1. 인증 토큰 발급
            String accessToken = getPortOneAccessToken();
            if (accessToken == null) {
                System.out.println("❌ 포트원 인증 토큰 발급 실패");
                return false;
            }
    
            // ✅ 2. 결제 정보 조회 API 호출
            String verificationUrl = "https://api.iamport.kr/payments/" + impUid;
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
    
            ResponseEntity<Map> response = restTemplate.exchange(
                verificationUrl, HttpMethod.GET, entity, Map.class);
    
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                System.out.println("❌ 포트원 결제 정보 조회 실패");
                return false;
            }
    
            // ✅ 3. 응답 데이터에서 결제 금액 검증
            Map<String, Object> responseData = response.getBody();
            Map<String, Object> paymentData = (Map<String, Object>) responseData.get("response");
    
            if (paymentData == null) {
                System.out.println("❌ 결제 데이터가 없습니다.");
                return false;
            }
    
            // ✅ amount 값이 Integer인지 Double인지 확인 후 변환
            Number amountPaidNumber = (Number) paymentData.get("amount");
            double amountPaid = amountPaidNumber.doubleValue(); // 🚀 안전한 변환 방식 사용
    
            if (amountPaid == expectedAmount) {
                System.out.println("✅ 결제 검증 완료! (주문번호: " + merchantUid + ")");
                return true;
            } else {
                System.out.println("❌ 결제 금액 불일치: 예상 " + expectedAmount + "원, 결제된 " + amountPaid + "원");
                return false;
            }
    
        } catch (Exception e) {
            System.out.println("❌ 결제 검증 중 오류 발생: " + e.getMessage());
            return false;
        }
    }
    
}
