package org.zerock.teamverse.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.teamverse.dto.PrivateChatMessageDTO;
import org.zerock.teamverse.entity.PrivateChatMessage;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.PrivateChatMessageRepository;
import org.zerock.teamverse.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PrivateChatMessageService {

    private final PrivateChatMessageRepository privateChatMessageRepository;
    private final UserRepository userRepository;

     // ✅ 개인 채팅 메시지 저장
     @Transactional
     public PrivateChatMessage saveMessage(PrivateChatMessageDTO messageDTO) {
         System.out.println("✅ [saveMessage] senderId: " + messageDTO.getSenderId() + ", recipientId: " + messageDTO.getRecipientId());
 
         // ✅ sender와 recipient 존재 여부 확인
         User sender = userRepository.findById(messageDTO.getSenderId()).orElse(null);
         User recipient = userRepository.findById(messageDTO.getRecipientId()).orElse(null);
 
         if (sender == null) {
             System.err.println("❌ senderId(" + messageDTO.getSenderId() + ")에 해당하는 사용자를 찾을 수 없음.");
             throw new RuntimeException("❌ senderId(" + messageDTO.getSenderId() + ")에 해당하는 사용자를 찾을 수 없음.");
         }
         if (recipient == null) {
             System.err.println("❌ recipientId(" + messageDTO.getRecipientId() + ")에 해당하는 사용자를 찾을 수 없음.");
             throw new RuntimeException("❌ recipientId(" + messageDTO.getRecipientId() + ")에 해당하는 사용자를 찾을 수 없음.");
         }
 
         System.out.println("📌 저장할 메시지: " + messageDTO.getContent());
         System.out.println("📤 sender: " + sender.getUsername() + " (" + sender.getId() + ")");
         System.out.println("📥 recipient: " + recipient.getUsername() + " (" + recipient.getId() + ")");
 
         PrivateChatMessage message = new PrivateChatMessage();
         message.setSender(sender);
         message.setRecipient(recipient);
         message.setContent(messageDTO.getContent());
 
         // ✅ 메시지 저장
         PrivateChatMessage savedMessage = privateChatMessageRepository.save(message);
 
         // ✅ sender, recipient 강제 로드 (JPA Lazy 로딩 문제 방지)
         savedMessage.setSender(userRepository.findById(savedMessage.getSender().getId()).orElse(null));
         savedMessage.setRecipient(userRepository.findById(savedMessage.getRecipient().getId()).orElse(null));
 
         System.out.println("✅ 저장 완료: sender=" + savedMessage.getSender().getUsername() + ", recipient=" + savedMessage.getRecipient().getUsername());
         return savedMessage;
     }

    // ✅ 두 유저 간의 개인 채팅 기록 조회
    @Transactional(readOnly = true)
    public List<PrivateChatMessage> getChatHistory(Long senderId, Long recipientId) {
        User sender = userRepository.findById(senderId).orElse(null);
        User recipient = userRepository.findById(recipientId).orElse(null);

        if (sender == null || recipient == null) {
            throw new RuntimeException("❌ 유효하지 않은 사용자입니다.");
        }

        return privateChatMessageRepository.findChatHistory(sender, recipient);
    }
}
