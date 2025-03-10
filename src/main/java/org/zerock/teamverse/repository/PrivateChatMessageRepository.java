package org.zerock.teamverse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.teamverse.entity.PrivateChatMessage;
import org.zerock.teamverse.entity.User;

import java.util.List;

public interface PrivateChatMessageRepository extends JpaRepository<PrivateChatMessage, Long> {
    
    // 두 유저 간의 개인 채팅 기록을 시간순으로 조회
    @Query("SELECT m FROM PrivateChatMessage m WHERE (m.sender = :sender AND m.recipient = :recipient) OR (m.sender = :recipient AND m.recipient = :sender) ORDER BY m.timestamp ASC")
    List<PrivateChatMessage> findChatHistory(@Param("sender") User sender, @Param("recipient") User recipient);
}
