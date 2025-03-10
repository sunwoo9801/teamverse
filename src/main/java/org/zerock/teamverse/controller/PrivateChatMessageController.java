package org.zerock.teamverse.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.dto.PrivateChatMessageDTO;
import org.zerock.teamverse.entity.PrivateChatMessage;
import org.zerock.teamverse.service.PrivateChatMessageService;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat/private")
@RequiredArgsConstructor
public class PrivateChatMessageController {

    private final PrivateChatMessageService privateChatMessageService;
    private final SimpMessagingTemplate messagingTemplate;
    //  WebSocket: 메시지 실시간 전송 (DB 저장 X)
    @MessageMapping("/chat/private")
    public void handlePrivateMessage(@Payload PrivateChatMessageDTO messageDTO) {
        System.out.println("📥 [WebSocket] 메시지 수신: " + messageDTO);

        // 수신자에게 실시간으로 메시지 전달
        messagingTemplate.convertAndSend(
          "/topic/chat/private/" + messageDTO.getRecipientId(),
          messageDTO
        );

        System.out.println("📤 [WebSocket] 메시지 전송 완료: " + messageDTO.getRecipientId());
    }

    //  REST API: 메시지 저장 (DB에 저장)
    @Transactional(propagation = Propagation.REQUIRES_NEW) // 새 트랜잭션 시작
    @PostMapping("/save")
    public ResponseEntity<PrivateChatMessageDTO> saveMessage(@RequestBody PrivateChatMessageDTO messageDTO) {
        System.out.println("📝 [DB 저장 요청] senderId=" + messageDTO.getSenderId() + ", recipientId=" + messageDTO.getRecipientId());

        PrivateChatMessage savedMessage = privateChatMessageService.saveMessage(messageDTO);

        PrivateChatMessageDTO responseDTO = new PrivateChatMessageDTO(
          savedMessage.getSender().getId(),
          savedMessage.getRecipient().getId(),
          savedMessage.getContent(),
          savedMessage.getTimestamp()
        );

        System.out.println("[DB 저장 완료] messageId=" + savedMessage.getId());
        return ResponseEntity.ok(responseDTO);
    }
    // 두 유저 간의 개인 채팅 기록 조회
    @GetMapping("/{recipientId}")
    public ResponseEntity<List<PrivateChatMessageDTO>> getChatHistory(
      @RequestParam Long senderId,
      @PathVariable Long recipientId) {

        List<PrivateChatMessage> messages = privateChatMessageService.getChatHistory(senderId, recipientId);

        List<PrivateChatMessageDTO> messageDTOs = messages.stream().map(message ->
          new PrivateChatMessageDTO(
            message.getSender().getId(),
            message.getRecipient().getId(),
            message.getContent(),
            message.getTimestamp())
        ).collect(Collectors.toList());

        return ResponseEntity.ok(messageDTOs);
    }
}
