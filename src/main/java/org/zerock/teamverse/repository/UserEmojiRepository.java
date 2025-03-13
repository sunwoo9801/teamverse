package org.zerock.teamverse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.zerock.teamverse.entity.UserEmoji;

@Repository
public interface UserEmojiRepository extends JpaRepository<UserEmoji, Long> {
    List<UserEmoji> findByUserId(Long userId);
}