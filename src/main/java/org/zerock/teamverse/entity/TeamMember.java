
/**
 * ProjectMember 엔티티
 * - 프로젝트와 사용자 간의 관계를 관리하는 중간 테이블
 */

 package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "team_members")
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project; // 프로젝트 정보

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 사용자 정보

    @Enumerated(EnumType.STRING)
    private Role role; // 프로젝트 내 역할 (예: LEADER, MEMBER)

    public enum Role {
        LEADER, MEMBER
    }
}
