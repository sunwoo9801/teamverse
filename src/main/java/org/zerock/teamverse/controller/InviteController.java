package org.zerock.teamverse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.service.InviteService;

import java.util.Map;

@RestController
@RequestMapping("/api/team") // ✅ 엔드포인트 수정
public class InviteController {

    private final InviteService inviteService;

    public InviteController(InviteService inviteService) {
        this.inviteService = inviteService;
    }

    // ✅ 팀원 초대 엔드포인트 추가
    @PostMapping("/invite")
    public ResponseEntity<String> inviteUser(
            @RequestBody Map<String, String> request, // ✅ JSON 데이터 받기
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        String senderEmail = authentication.getName(); // 현재 로그인한 사용자
        String receiverEmail = request.get("email"); // 초대할 사용자 이메일
        Long projectId = Long.parseLong(request.get("projectId")); // 프로젝트 ID

        // 초대 실행
        inviteService.createInvite(senderEmail, receiverEmail, projectId);

        return ResponseEntity.ok("초대가 성공적으로 전송되었습니다.");
    }

    // ✅ 기존 초대 수락 기능 유지
    @PostMapping("/{inviteId}/accept")
    public ResponseEntity<String> acceptInvite(@PathVariable Long inviteId) {
        inviteService.acceptInvite(inviteId);
        return ResponseEntity.ok("초대를 수락했습니다!");
    }
}
