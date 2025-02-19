/**
 * Users 엔티티
 * - 사용자 계정 정보를 저장
 * - 로그인, 팀 멤버 관리, 작업 배정 등 사용자와 관련된 기능에서 사용
 */
package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Users 엔티티
 * - 사용자 계정 정보를 저장
 * - 로그인, 팀 멤버 관리, 작업 배정 등 사용자와 관련된 기능에서 사용
 */
@Data
@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "teamProjects"}) // ✅ 순환 참조 방지

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

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeamMember> teamProjects; // 사용자가 속한 팀 프로젝트 목록

      // ✅ 추가된 필드들 (회원 정보 모달에서 사용)
      @Column(name = "company_name")
      private String companyName;  // 회사명
  
      @Column(name = "department")
      private String department;   // 부서명
  
      @Column(name = "position")
      private String position;     // 직책 (예: 팀장, 개발자 등)
  
      @Column(name = "phone_number")
      private String phoneNumber;  // 휴대폰 번호
  
      @Column(name = "password_reset_token")
      private String passwordResetToken; // 비밀번호 재설정 토큰

    public enum Role {
        ADMIN, MEMBER
    }

    public enum Status {
        ACTIVE, INACTIVE
    }
}
