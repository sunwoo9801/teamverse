package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false) // 프로젝트 기반 채팅
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Lazy 로딩 문제 해결
    @OnDelete(action = OnDeleteAction.CASCADE) // ✅ 프로젝트 삭제 시, 자동 삭제
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Lazy 로딩 문제 해결
    private User sender;

    @Column(nullable = false)
    private String content;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_private_chat", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE") // 개인 채팅 여부
    private boolean isPrivateChat = false;

    @Column(name = "is_announcement", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE") // 공지 여부
    private boolean isAnnouncement = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id") // 개인 채팅 시 수신자 정보 저장
    private User recipient;


}
