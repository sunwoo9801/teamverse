package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Getter
@Setter
public class PrivateChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)  // LAZY 로딩으로 최적화
    @JoinColumn(name = "sender_id", nullable = false)
    @OnDelete(action = OnDeleteAction.SET_NULL)  // User 삭제 시 sender_id를 NULL로 설정
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)  // LAZY 로딩으로 최적화
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
}
