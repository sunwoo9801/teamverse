package org.zerock.teamverse.service;

import org.zerock.teamverse.entity.Comment;
import org.zerock.teamverse.entity.Task;
import org.zerock.teamverse.entity.ActivityLog;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.CommentRepository;
import org.zerock.teamverse.repository.TaskRepository;
import org.zerock.teamverse.repository.ActivityLogRepository;
import org.zerock.teamverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

        private final CommentRepository commentRepository;
        private final ActivityLogRepository activityLogRepository;
        private final TaskRepository taskRepository;
        private final UserRepository userRepository;

        // 특정 게시글의 댓글 조회
        public List<Comment> getCommentsByActivity(Long activityId) {
                ActivityLog activity = activityLogRepository.findById(activityId)
                                .orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다."));
                return commentRepository.findByActivityOrderByCreatedAtAsc(activity);
        }

        // 특정 Task의 댓글 조회
        public List<Comment> getCommentsByTask(Long taskId) {
                Task task = taskRepository.findById(taskId)
                                .orElseThrow(() -> new IllegalArgumentException("해당 작업(Task)을 찾을 수 없습니다."));
                return commentRepository.findByTaskOrderByCreatedAtAsc(task);
        }

        // 게시글 댓글 추가
        @Transactional
        public Comment addCommentToActivity(Long activityId, Long userId, String content) {
                ActivityLog activity = activityLogRepository.findById(activityId)
                                .orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다."));
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

                Comment newComment = Comment.builder()
                                .activity(activity)
                                .user(user)
                                .content(content)
                                .build();

                return commentRepository.save(newComment);
        }

        // Task 댓글 추가
        @Transactional
        public Comment addCommentToTask(Long taskId, Long userId, String content) {
                Task task = taskRepository.findById(taskId)
                                .orElseThrow(() -> new IllegalArgumentException("해당 작업(Task)을 찾을 수 없습니다."));
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

                Comment newComment = Comment.builder()
                                .task(task)
                                .user(user)
                                .content(content)
                                .build();

                return commentRepository.save(newComment);
        }

        @Transactional
        public void deleteComment(Long commentId, Long userId) {
                Comment comment = commentRepository.findById(commentId)
                                .orElseThrow(() -> new IllegalArgumentException("해당 댓글을 찾을 수 없습니다."));

                if (!comment.getUser().getId().equals(userId)) {
                        throw new SecurityException("자신의 댓글만 삭제할 수 있습니다.");
                }

                commentRepository.delete(comment);
        }

        @Transactional
        public Comment updateComment(Long commentId, Long userId, String content) {
                Comment comment = commentRepository.findById(commentId)
                                .orElseThrow(() -> new IllegalArgumentException("해당 댓글을 찾을 수 없습니다."));

                if (!comment.getUser().getId().equals(userId)) {
                        throw new SecurityException("자신의 댓글만 수정할 수 있습니다.");
                }

                comment.setContent(content);
                return commentRepository.save(comment);
        }

}
