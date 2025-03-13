package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Comment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 댓글 ID

    @ManyToOne(fetch = FetchType.LAZY) // 게시글과의 관계 (N:1)
    @JoinColumn(name = "activity_id", nullable = true)
    private ActivityLog activity; // 어느 게시글(피드)에 달린 댓글인지

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "task_id", nullable = true) // Task와 연결 (nullable)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY) // 작성자 정보 (N:1)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 댓글 작성자

    @Column(nullable = false, length = 500)
    private String content; // 댓글 내용

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 자동으로 `createdAt` 값을 설정하는 메서드 추가
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}