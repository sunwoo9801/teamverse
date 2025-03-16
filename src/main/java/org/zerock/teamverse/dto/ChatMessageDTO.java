package org.zerock.teamverse.dto;

import java.time.LocalDateTime;

import org.zerock.teamverse.entity.ChatMessage;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageDTO {
    private Long id;
    private String content;
    private String senderEmail;
    private String senderUsername; // ✅ 추가
    private Long projectId;
    private LocalDateTime createdAt; // ✅ 기존 `timestamp` 대신 사용


    public ChatMessageDTO() {}

    public ChatMessageDTO(ChatMessage message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.projectId = message.getProject().getId();
        this.createdAt = message.getCreatedAt(); // ✅ DB에서 저장된 `created_at` 값 유지

        if (message.getSender() != null) {
            this.senderEmail = message.getSender().getEmail();
            this.senderUsername = message.getSender().getUsername(); // ✅ `username` 추가
        } else {
            this.senderEmail = "unknown";
            this.senderUsername = "알 수 없음";
        }
    }
}