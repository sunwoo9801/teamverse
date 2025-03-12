package org.zerock.teamverse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.service.UserEmojiService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/{userId}/emojis")
public class UserEmojiController {

    private final UserEmojiService userEmojiService;

    public UserEmojiController(UserEmojiService userEmojiService) {
        this.userEmojiService = userEmojiService;
    }

    // 사용자가 구매한 이모티콘 목록 조회
    @GetMapping
    public ResponseEntity<List<String>> getUserEmojis(@PathVariable Long userId) {
        List<String> emojiIds = userEmojiService.getOwnedEmojis(userId);
        return ResponseEntity.ok(emojiIds);
    }

    // 이모티콘 구매 정보 저장
    @PostMapping
    public ResponseEntity<?> addUserEmoji(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        String emojiId = body.get("emojiId");
        userEmojiService.addOwnedEmoji(userId, emojiId);
        return ResponseEntity.ok("구매 완료");
    }
}
