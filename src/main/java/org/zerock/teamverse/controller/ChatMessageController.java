package org.zerock.teamverse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.dto.ChatMessageDTO;
import org.zerock.teamverse.entity.ChatMessage;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.service.ChatMessageService;
import org.zerock.teamverse.service.ProjectService;
import org.zerock.teamverse.service.UserService;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/chat")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;
    private final ProjectService projectService;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate; // ✅ WebSocket 메시지 브로드캐스트를 위한 SimpMessagingTemplate

    public ChatMessageController(ChatMessageService chatMessageService, ProjectService projectService, UserService userService, SimpMessagingTemplate messagingTemplate) {
        this.chatMessageService = chatMessageService;
        this.projectService = projectService;
        this.userService = userService;
        this.messagingTemplate = messagingTemplate;
    }

    // ✅ 특정 프로젝트의 채팅 기록 조회 (HTTP API)
    @GetMapping("/{projectId}")
    public ResponseEntity<List<ChatMessage>> getProjectChat(@PathVariable Long projectId) {
        Project project = projectService.getProjectById(projectId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));
        return ResponseEntity.ok(chatMessageService.getChatMessages(project));
    }

    // ✅ WebSocket을 통해 채팅 메시지 전송 및 DB 저장
    @MessageMapping("/chat")
    @Transactional  // 🔥 트랜잭션 적용
    public void sendMessage(@Payload ChatMessage chatMessage) {
        System.out.println("📩 채팅 메시지 수신: " + chatMessage.getContent());

        Long projectId = chatMessage.getProject().getId();
        Project project = projectService.getProjectById(projectId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));

        // ✅ sender의 email이 있는지 확인
        if (chatMessage.getSender().getEmail() == null) {
            throw new RuntimeException("🚨 보낸 사람 이메일이 없습니다!");
        }
        User sender = userService.findByEmail(chatMessage.getSender().getEmail())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // ✅ 메시지를 DB에 저장
        ChatMessage savedMessage = chatMessageService.saveMessage(project, sender, chatMessage.getContent());

        // ✅ WebSocket을 통해 메시지를 보낼 때, `sender.username` 포함
        ChatMessage responseMessage = new ChatMessage();
        responseMessage.setId(savedMessage.getId());
        responseMessage.setProject(savedMessage.getProject());
        responseMessage.setSender(sender); // ✅ 여기서 sender 정보 그대로 사용
        responseMessage.setContent(savedMessage.getContent());
        responseMessage.setCreatedAt(savedMessage.getCreatedAt());

        System.out.println("✅ 채팅 메시지 저장 완료! ID: " + savedMessage.getId());
        

        // ✅ 저장된 메시지를 WebSocket을 통해 프로젝트의 모든 팀원에게 전송
        messagingTemplate.convertAndSend("/topic/chat/" + projectId, savedMessage);
    }

}
