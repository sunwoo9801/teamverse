package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "project_id", nullable = false) // ✅ 프로젝트 기반 채팅
    private Project project; 

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender; 

    @Column(nullable = false)
    private String content; 

    private boolean isAnnouncement = false; 

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
