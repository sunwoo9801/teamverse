package org.zerock.teamverse.controller;

import org.zerock.teamverse.dto.CommentDTO;
import org.zerock.teamverse.entity.ActivityLog;
import org.zerock.teamverse.entity.Comment;
import org.zerock.teamverse.entity.Task;
import org.zerock.teamverse.repository.ActivityLogRepository;
import org.zerock.teamverse.repository.TaskRepository;
import org.zerock.teamverse.service.CommentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects/{projectId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final ActivityLogRepository activityLogRepository; // 추가: activity 검증용
    private final TaskRepository taskRepository; // 추가: task 검증용

    @Data
    static class CommentRequest {
        private Long userId;
        private String content;
    }

    // 특정 게시글의 댓글 조회 (DTO로 변환)
    @GetMapping("/activity/{activityId}")
    public List<CommentDTO> getCommentsByActivity(@PathVariable Long projectId, @PathVariable Long activityId) {
        // activity에 연결된 프로젝트가 요청 projectId와 일치하는지 검증
        ActivityLog activity = activityLogRepository.findById(activityId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다."));
        if (!activity.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("프로젝트가 일치하지 않습니다.");
        }
        List<Comment> comments = commentService.getCommentsByActivity(activityId);
        return comments.stream().map(CommentDTO::fromEntity).collect(Collectors.toList());
    }

    // 특정 Task의 댓글 조회 (DTO로 변환)
    @GetMapping("/task/{taskId}")
    public List<CommentDTO> getCommentsByTask(@PathVariable Long projectId, @PathVariable Long taskId) {
        // task에 연결된 프로젝트가 요청 projectId와 일치하는지 검증
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("해당 작업(Task)을 찾을 수 없습니다."));
        if (!task.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("프로젝트가 일치하지 않습니다.");
        }
        List<Comment> comments = commentService.getCommentsByTask(taskId);
        return comments.stream().map(CommentDTO::fromEntity).collect(Collectors.toList());
    }

    // 게시글에 댓글 추가 (DTO 반환)
    @PostMapping("/activity/{activityId}")
    public CommentDTO addCommentToActivity(@PathVariable Long projectId, @PathVariable Long activityId,
            @RequestBody CommentRequest request) {
        // activity에 연결된 프로젝트가 요청 projectId와 일치하는지 검증
        ActivityLog activity = activityLogRepository.findById(activityId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다."));
        if (!activity.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("프로젝트가 일치하지 않습니다.");
        }
        Comment comment = commentService.addCommentToActivity(activityId, request.getUserId(), request.getContent());
        return CommentDTO.fromEntity(comment);
    }

    // Task에 댓글 추가 (DTO 반환)
    @PostMapping("/task/{taskId}")
    public CommentDTO addCommentToTask(@PathVariable Long projectId, @PathVariable Long taskId,
            @RequestBody CommentRequest request) {
        // task에 연결된 프로젝트가 요청 projectId와 일치하는지 검증
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("해당 작업(Task)을 찾을 수 없습니다."));
        if (!task.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("프로젝트가 일치하지 않습니다.");
        }
        Comment comment = commentService.addCommentToTask(taskId, request.getUserId(), request.getContent());
        return CommentDTO.fromEntity(comment);
    }

    // 댓글 수정 (DTO 반환)
    @PutMapping("/{commentId}")
    public CommentDTO updateComment(@PathVariable Long projectId, @PathVariable Long commentId,
            @RequestBody CommentRequest request) {
        // (선택 사항) 댓글 수정 시에도 부모 entity의 프로젝트 정보 검증을 추가할 수 있음
        Comment comment = commentService.updateComment(commentId, request.getUserId(), request.getContent());
        return CommentDTO.fromEntity(comment);
    }

    // 댓글 삭제 (응답 상태만 반환)
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long projectId, @PathVariable Long commentId,
            @RequestParam Long userId) {
        // (선택 사항) 삭제 시에도 검증 추가 가능
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.ok().build();
    }
}
