package org.zerock.teamverse.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.zerock.teamverse.entity.Post;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class PostDTO {
    private Long id;
    private String title; // ✅ 추가: 게시글 제목
    private String content;
    private LocalDateTime createdAt;
    private Long userId;
    private String username;

    // ✅ Post 엔티티에서 DTO로 변환하는 생성자
    public PostDTO(Post post) {
        this.id = post.getId();
        this.title = post.getTitle(); // ✅ 제목 추가
        this.content = post.getContent();
        this.createdAt = post.getCreatedAt();
        this.userId = post.getUser().getId();
        this.username = post.getUser().getUsername();
    }
}
