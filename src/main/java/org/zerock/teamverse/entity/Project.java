
/**
 * Projects 엔티티
 * - 팀별 프로젝트 정보를 저장
 * - Gantt 차트, 작업(Task) 관리에서 사용
 */
package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Projects 엔티티
 * - 팀별 프로젝트 정보를 저장
 * - Gantt 차트, 작업(Task) 관리에서 사용
 */
@Entity
@Getter
@Setter
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner; // 프로젝트 생성자

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team; // 프로젝트가 속한 팀

    @Column(nullable = false)
    private String name; // 프로젝트 이름

    private String description; // 프로젝트 설명

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate; // 프로젝트 시작일

    @Column(name = "end_date")
    private LocalDate endDate; // 프로젝트 종료일

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // ✅ 기존의 다대다 관계 삭제 후, 일대다 관계로 변경
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeamMember> teamMembers;

    // ✅ 프로젝트 생성 시 자동으로 생성 날짜 저장
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ✅ 프로젝트 수정 시 자동으로 수정 날짜 갱신
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ✅ 팀 멤버 추가
    public void addTeamMember(TeamMember teamMember) {
        this.teamMembers.add(teamMember);
    }
}
