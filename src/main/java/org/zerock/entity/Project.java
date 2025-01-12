package org.zerock.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Projects 엔티티
 * - 팀별 프로젝트 정보를 저장
 * - Gantt 차트, 작업(Task) 관리에서 사용
 */
@Data
@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team; // 프로젝트가 속한 팀

    @Column(nullable = false)
    private String name; // 프로젝트 이름

    private String description; // 프로젝트 설명

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate; // 프로젝트 시작일

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate; // 프로젝트 종료일

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
