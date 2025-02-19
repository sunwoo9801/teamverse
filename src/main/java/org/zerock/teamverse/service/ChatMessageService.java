package org.zerock.teamverse.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.teamverse.entity.ChatMessage;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.ChatMessageRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatMessageService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    // ✅ 메시지 저장 메서드 (DB에 저장)
    @Transactional
    public ChatMessage saveMessage(Project project, User sender, String content) {
        System.out.println("📝 메시지 저장 요청: 프로젝트=" + project.getName() + ", 보낸 사람=" + sender.getEmail() + ", 내용=" + content);

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setProject(project);
        chatMessage.setSender(sender);
        chatMessage.setContent(content);
        chatMessage.setCreatedAt(LocalDateTime.now());

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage); // ✅ DB에 저장
        System.out.println("✅ 저장된 메시지 ID: " + savedMessage.getId());

        return savedMessage;
    }

    // ✅ 특정 프로젝트의 메시지 목록 조회
    public List<ChatMessage> getChatMessages(Project project) {
        return chatMessageRepository.findByProject(project);
    }
}
