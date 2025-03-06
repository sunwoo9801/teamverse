package org.zerock.teamverse.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.dto.PrivateChatMessageDTO;
import org.zerock.teamverse.entity.PrivateChatMessage;
import org.zerock.teamverse.service.PrivateChatMessageService;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat/private")    
public class PrivateChatMessageController {

    private final PrivateChatMessageService privateChatMessageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/private/send")
    public void sendPrivateMessage(@Payload PrivateChatMessageDTO messageDTO, Principal principal) {
    System.out.println("📨 WebSocket 메시지 수신: senderId=" + messageDTO.getSenderId() +
                       ", recipientId=" + messageDTO.getRecipientId() +
                       ", content=" + messageDTO.getContent());

    PrivateChatMessage savedMessage = privateChatMessageService.saveMessage(messageDTO);

    PrivateChatMessageDTO responseMessage = new PrivateChatMessageDTO(
        savedMessage.getSender().getId(),
        savedMessage.getRecipient().getId(),
        savedMessage.getContent(),
        savedMessage.getTimestamp()
    );

    // ✅ 메시지 전송
    messagingTemplate.convertAndSendToUser(
        savedMessage.getRecipient().getId().toString(),
        "/topic/chat/private",
        responseMessage
    );
    String recipientPath = "/topic/chat/private";
    System.out.println("📤 [Spring] 메시지 전송: " + recipientPath + " → " + responseMessage);

}


    // ✅ 채팅 기록 조회 REST API
    @GetMapping("/{recipientId}")
    public ResponseEntity<List<PrivateChatMessage>> getPrivateChatMessages(
            @RequestParam Long senderId, 
            @PathVariable Long recipientId) {
        List<PrivateChatMessage> chatHistory = privateChatMessageService.getChatHistory(senderId, recipientId);
        return new ResponseEntity<>(chatHistory, HttpStatus.OK);
    }
}
