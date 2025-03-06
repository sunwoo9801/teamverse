package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "likes")
public class Like {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user; // ✅ 좋아요를 누른 사용자

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "activity_id", nullable = true) // ✅ NULL 허용
  private ActivityLog activity;
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "task_id", nullable = true) // ✅ NULL 허용
  private Task task;
  

  @Enumerated(EnumType.STRING)
  private LikeType type; // ✅ 좋아요의 감정 타입 추가
  
}
