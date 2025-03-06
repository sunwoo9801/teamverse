package org.zerock.teamverse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PrivateChatMessageDTO {
    private Long senderId;
    private Long recipientId;
    private String content;
    private LocalDateTime timestamp;
}
