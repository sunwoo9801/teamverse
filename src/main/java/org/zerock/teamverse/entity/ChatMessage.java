package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * ChatMessages 엔티티
 * - 팀 채팅 메시지를 저장
 * - 실시간 채팅 및 메시지 내역 조회에서 사용
 */
@Data
@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "team_id", nullable = false)
    private Team team; // 메시지가 속한 팀

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender; // 메시지를 보낸 사용자

    @Column(nullable = false)
    private String content; // 메시지 내용

    private boolean isAnnouncement = false; // 공지사항 여부

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
