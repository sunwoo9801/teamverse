package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Tasks 엔티티
 * - 프로젝트 내 작업 정보를 저장
 * - Gantt 차트, 작업 체크리스트에서 사용
 */
@Data
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore // Lazy-loaded 필드 직렬화 방지
    private Project project; // 작업이 속한 프로젝트

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo; // 작업 담당자

    @Column(nullable = false)
    private String name; // 작업 이름

    @Enumerated(EnumType.STRING)
    private Status status = Status.TODO; // 작업 상태

    private String color; // Gantt 차트에서 작업 색상

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate; // 작업 마감일

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Status {
        TODO, IN_PROGRESS, DONE
    }
}
