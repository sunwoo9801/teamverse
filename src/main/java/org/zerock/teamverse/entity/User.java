package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Users 엔티티
 * - 사용자 계정 정보를 저장
 * - 로그인, 팀 멤버 관리, 작업 배정 등 사용자와 관련된 기능에서 사용
 */
@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role = Role.MEMBER; // 사용자 역할 (ADMIN 또는 MEMBER)

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE; // 사용자 상태 (ACTIVE 또는 INACTIVE)

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

     // 기본 생성자 (JPA에서 필수)
     public User() {}

     // 사용자 정의 생성자
     public User(String email, String password) {
        //  this.username = username;
         this.email = email;
         this.password = password;
     }

    public enum Role {
        ADMIN, MEMBER
    }

    public enum Status {
        ACTIVE, INACTIVE
    }
    @ManyToMany(mappedBy = "teamMembers") // 프로젝트에서 초대받은 관계
    private Set<Project> projects = new HashSet<>();

}
