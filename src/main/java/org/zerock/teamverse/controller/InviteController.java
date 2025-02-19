package org.zerock.teamverse.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.dto.InviteRequestDTO;
import org.zerock.teamverse.entity.Invite;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.service.InviteService;
import org.zerock.teamverse.service.ProjectService;
import org.zerock.teamverse.service.UserService;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/team") // ✅ 엔드포인트
public class InviteController {

    private final InviteService inviteService;
    private final UserService userService;
    private final ProjectService projectService;

    public InviteController(InviteService inviteService, UserService userService, ProjectService projectService) {
        this.inviteService = inviteService;
        this.userService = userService;
        this.projectService = projectService;
    }

    // ✅ user1이 user2를 초대하는 API
    @PostMapping("/invite")
    public ResponseEntity<String> inviteUser(@RequestBody InviteRequestDTO request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
    
        if (request.getEmail() == null || request.getProjectId() == null) {
            return ResponseEntity.status(400).body("이메일 또는 프로젝트 ID가 누락되었습니다.");
        }
    
        String senderEmail = authentication.getName();
        User sender = userService.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("초대한 사용자를 찾을 수 없습니다."));
    
        User receiver = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("초대받을 사용자를 찾을 수 없습니다."));
    
        Project project = projectService.getProjectById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));
    
        inviteService.createInvite(sender, receiver, project);
    
        return ResponseEntity.ok("초대가 성공적으로 전송되었습니다.");
    }
    
    // ✅ user2가 받은 초대 목록 조회 API
    @GetMapping("/invites")
    public ResponseEntity<List<Invite>> getUserInvites(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.emptyList());
        }

        String userEmail = authentication.getName();
        User user = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // ✅ 해당 사용자가 받은 초대 조회
        List<Invite> invites = inviteService.getUserInvites(user);
        
        System.out.println("📌 " + user.getEmail() + "의 초대 목록: " + invites.size() + "개"); // ✅ 로그 추가

        return ResponseEntity.ok(invites);
    }

    

    // ✅ user2가 초대를 수락하는 API
    @PostMapping("/invite/{inviteId}/accept")
    public ResponseEntity<String> acceptInvite(@PathVariable Long inviteId) {
        inviteService.acceptInvite(inviteId);
        return ResponseEntity.ok("초대를 수락했습니다!");
    }
}
