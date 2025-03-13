package org.zerock.teamverse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.teamverse.entity.ActivityLog;
import org.zerock.teamverse.entity.Comment;
import org.zerock.teamverse.entity.Task;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByActivityOrderByCreatedAtAsc(ActivityLog activity); // 특정 게시글(피드)의 댓글을 시간순으로 조회

    List<Comment> findByTaskOrderByCreatedAtAsc(Task task);

}