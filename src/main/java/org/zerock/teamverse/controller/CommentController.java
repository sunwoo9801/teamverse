package org.zerock.teamverse.controller;

import org.zerock.teamverse.dto.CommentDTO;
import org.zerock.teamverse.entity.Comment;
import org.zerock.teamverse.service.CommentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @Data
    static class CommentRequest {
        private Long userId;
        private String content;
    }

    // 특정 게시글의 댓글 조회 (DTO로 변환)
    @GetMapping("/activity/{activityId}")
    public List<CommentDTO> getCommentsByActivity(@PathVariable Long activityId) {
        List<Comment> comments = commentService.getCommentsByActivity(activityId);
        return comments.stream().map(CommentDTO::fromEntity).collect(Collectors.toList());
    }

    // 특정 Task의 댓글 조회 (DTO로 변환)
    @GetMapping("/task/{taskId}")
    public List<CommentDTO> getCommentsByTask(@PathVariable Long taskId) {
        List<Comment> comments = commentService.getCommentsByTask(taskId);
        return comments.stream().map(CommentDTO::fromEntity).collect(Collectors.toList());
    }

    // 게시글에 댓글 추가 (DTO 반환)
    @PostMapping("/activity/{activityId}")
    public CommentDTO addCommentToActivity(@PathVariable Long activityId, @RequestBody CommentRequest request) {
        Comment comment = commentService.addCommentToActivity(activityId, request.getUserId(), request.getContent());
        return CommentDTO.fromEntity(comment);
    }

    // Task에 댓글 추가 (DTO 반환)
    @PostMapping("/task/{taskId}")
    public CommentDTO addCommentToTask(@PathVariable Long taskId, @RequestBody CommentRequest request) {
        Comment comment = commentService.addCommentToTask(taskId, request.getUserId(), request.getContent());
        return CommentDTO.fromEntity(comment);
    }

    // 댓글 수정 (DTO 반환)
    @PutMapping("/{commentId}")
    public CommentDTO updateComment(@PathVariable Long commentId, @RequestBody CommentRequest request) {
        Comment comment = commentService.updateComment(commentId, request.getUserId(), request.getContent());
        return CommentDTO.fromEntity(comment);
    }

    // 댓글 삭제 (응답 상태만 반환)
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId, @RequestParam Long userId) {
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.ok().build();
    }
}
