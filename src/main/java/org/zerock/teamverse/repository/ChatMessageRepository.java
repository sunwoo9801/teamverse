package org.zerock.teamverse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.zerock.teamverse.entity.ChatMessage;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.User;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByProject(Project project);

    // 특정 사용자 간의 개인 채팅 불러오기
    @Query("SELECT m FROM ChatMessage m WHERE (m.sender = :user1 AND m.recipient = :user2) OR (m.sender = :user2 AND m.recipient = :user1) ORDER BY m.createdAt ASC")
    List<ChatMessage> findPrivateMessages(User user1, User user2);
}

