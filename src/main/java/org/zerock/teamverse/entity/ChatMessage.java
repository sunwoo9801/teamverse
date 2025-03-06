package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false) // ✅ 프로젝트 기반 채팅
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // ✅ Lazy 로딩 문제 해결
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // ✅ Lazy 로딩 문제 해결
    private User sender;

    @Column(nullable = false)
    private String content;

    private boolean isAnnouncement = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
