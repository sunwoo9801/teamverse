package org.zerock.teamverse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.service.InviteService;

@RestController
@RequestMapping("/api/invites")
public class InviteController {

    private final InviteService inviteService;

    public InviteController(InviteService inviteService) {
        this.inviteService = inviteService;
    }

    @PostMapping("/{inviteId}/accept")
    public ResponseEntity<String> acceptInvite(@PathVariable Long inviteId) {
        inviteService.acceptInvite(inviteId);
        return ResponseEntity.ok("초대를 수락했습니다!");
    }
}
