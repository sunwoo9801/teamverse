package org.zerock.teamverse.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.entity.UserEmoji;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.UserEmojiRepository;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class UserEmojiService {

    private final UserEmojiRepository userEmojiRepository;

    public UserEmojiService(UserEmojiRepository userEmojiRepository) {
        this.userEmojiRepository = userEmojiRepository;
    }

    public List<String> getOwnedEmojis(Long userId) {
        return userEmojiRepository.findByUserId(userId)
                                  .stream()
                                  .map(UserEmoji::getEmojiId)
                                  .collect(Collectors.toList());
    }

    public void addOwnedEmoji(Long userId, String emojiId) {
        // 중복 구매를 방지할 수 있도록 체크 후 저장
        boolean alreadyOwned = userEmojiRepository.findByUserId(userId)
                              .stream()
                              .anyMatch(e -> e.getEmojiId().equals(emojiId));
        if (!alreadyOwned) {
            UserEmoji userEmoji = new UserEmoji();
            userEmoji.setUserId(userId);
            userEmoji.setEmojiId(emojiId);
            userEmojiRepository.save(userEmoji);
        }
    }
}

