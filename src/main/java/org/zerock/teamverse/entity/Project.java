package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.HashSet;
import java.util.Set;

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


        // ✅ 프로젝트를 생성한 사용자 정보 추가
        @ManyToOne
        @JoinColumn(name = "user_id", nullable = false) // 🔹 user_id 외래키 추가
        private User user;

        @ManyToOne
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

    // ✅ 초대된 멤버 리스트를 ManyToMany 관계로 설정
    @ManyToMany
    @JoinTable(
        name = "project_members", // 중간 테이블 이름
        joinColumns = @JoinColumn(name = "project_id"), // 현재 엔티티의 조인 컬럼
        inverseJoinColumns = @JoinColumn(name = "user_id") // 반대 엔티티의 조인 컬럼
    )
    
    private Set<User> members = new HashSet<>(); // ✅ 프로젝트에 참여한 사용자 목록

    public void addMember(User user) {
        members.add(user);  // ✅ 사용자 추가
    }
    private Set<User> teamMembers = new HashSet<>();

    public Set<User> getTeamMembers() {
        return teamMembers;
    }

    public void setTeamMembers(Set<User> teamMembers) {
        this.teamMembers = teamMembers;

    }
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

    // ✅ 프로젝트 소유자 설정
    public void setOwner(User owner) {
        this.owner = owner;
    }

    // ✅ 팀 멤버 추가
    public void addTeamMember(User user) {
        this.teamMembers.add(user);
    }

    
}
