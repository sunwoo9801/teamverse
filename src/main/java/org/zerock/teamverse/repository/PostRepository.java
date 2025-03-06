package org.zerock.teamverse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.teamverse.entity.Post;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByProjectIdOrderByCreatedAtDesc(Long projectId);
}