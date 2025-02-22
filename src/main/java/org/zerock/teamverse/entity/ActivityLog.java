package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * ActivityLogs 엔티티
 * - 사용자 활동 기록을 저장
 */
@Data
@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // ✅ 활동을 수행한 사용자

    @Column(name = "activity_type", nullable = false)
    private String activityType; // ✅ 활동 유형

    @Column(name = "activity_description")
    private String activityDescription; // ✅ 활동 상세 설명

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY) // ✅ 활동 로그는 하나의 프로젝트에 속함
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // ✅ **프로필 이미지 추가 (User의 getProfileImage() 활용)**
    public String getProfileImage() {
        return user != null ? user.getProfileImage() : "/assets/images/basicprofile.jpg";
    }
}
