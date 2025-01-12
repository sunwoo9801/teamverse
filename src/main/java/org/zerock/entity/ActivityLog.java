package org.zerock.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * ActivityLogs 엔티티
 * - 사용자 활동 기록을 저장
 * - 활동 내역 조회 및 프로젝트 상태 추적에서 사용
 */
@Data
@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 활동을 수행한 사용자

    @Column(name = "activity_type", nullable = false)
    private String activityType; // 활동 유형 (예: "Task Created")

    @Column(name = "activity_description", nullable = false)
    private String activityDescription; // 활동 상세 설명

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
