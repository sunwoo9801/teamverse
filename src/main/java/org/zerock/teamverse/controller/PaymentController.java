package org.zerock.teamverse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.service.PaymentService;

import java.util.Map;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * 결제 완료 후 검증 API
     * @param requestData 결제 검증 요청 데이터 (imp_uid, merchant_uid, amount)
     * @return 검증 결과 응답
     */
    @PostMapping("/complete")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> requestData) {
        String impUid = (String) requestData.get("imp_uid");  // key 수정
        String merchantUid = (String) requestData.get("merchant_uid");  // key 수정
        double expectedAmount = Double.parseDouble(requestData.get("amount").toString());  // 금액 추가
    
        System.out.println("결제 검증 요청 수신: impUid=" + impUid + ", merchantUid=" + merchantUid + ", amount=" + expectedAmount);

        if (impUid == null || merchantUid == null) {
            return ResponseEntity.badRequest().body("❌ 유효하지 않은 요청입니다.");
        }

        boolean isVerified = paymentService.verifyPayment(impUid, merchantUid, expectedAmount);
        if (isVerified) {
            return ResponseEntity.ok("결제 검증 완료");
        } else {
            return ResponseEntity.badRequest().body("❌ 결제 검증 실패");
        }
    }

    /**
     * 포트원 API 토큰 확인 엔드포인트
     * @return 발급된 API 토큰
     */
    @GetMapping("/token")
    public ResponseEntity<?> getPortOneToken() {
        String accessToken = paymentService.getPortOneAccessToken();
        if (accessToken != null) {
            return ResponseEntity.ok(Map.of("access_token", accessToken));
        } else {
            return ResponseEntity.status(500).body("❌ 포트원 API 토큰 발급 실패");
        }
    }
}
