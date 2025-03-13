package org.zerock.teamverse.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDTO {
    private Long id;
    private Long activityId; // 댓글이 달린 게시글 ID (없으면 null)
    private Long taskId;     // 댓글이 달린 Task ID (없으면 null)
    private Long userId;     // 댓글 작성자 ID
    private String username; // 댓글 작성자 이름
    private String profileImage; // 프로필 이미지 (없으면 null)
    private String content;  // 댓글 내용
    private LocalDateTime createdAt; // 댓글 작성 일시

    // 엔티티를 DTO로 변환하는 헬퍼 메서드
    public static CommentDTO fromEntity(org.zerock.teamverse.entity.Comment comment) {
        return CommentDTO.builder()
                .id(comment.getId())
                .activityId(comment.getActivity() != null ? comment.getActivity().getId() : null)
                .taskId(comment.getTask() != null ? comment.getTask().getId() : null)
                .userId(comment.getUser() != null ? comment.getUser().getId() : null)
                .username(comment.getUser() != null ? comment.getUser().getUsername() : "익명")
                .profileImage(comment.getUser() != null ? comment.getUser().getProfileImage() : null)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
