package org.zerock.teamverse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.dto.LikeRequest;
import org.zerock.teamverse.entity.LikeType;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.service.LikeService;
import org.zerock.teamverse.service.UserService;

import java.util.Map;

@RestController
@RequestMapping("/api/likes")
public class LikeController {
    private final LikeService likeService;
    private final UserService userService;

    public LikeController(LikeService likeService, UserService userService) {
        this.likeService = likeService;
        this.userService = userService;
    }

   
    // @PostMapping("/toggle")
    // public ResponseEntity<Map<String, Boolean>> toggleLike(
    //         @RequestBody Map<String, Object> requestBody,
    //         @RequestHeader(value = "Authorization", required = false) String authHeader,
    //         Authentication authentication) {
    
    //     System.out.println("📌 요청된 데이터: " + requestBody); // 프론트에서 보낸 JSON 확인
    
    //     String email = authentication.getName();
    //     System.out.println("✅ 인증된 사용자: " + email);
    
    //     // 🛠 null 체크 후 변환 (NPE 방지)
    //     Long activityId = null;
    //     Long taskId = null;
        
    //     if (requestBody.get("activityId") != null) {
    //         activityId = ((Number) requestBody.get("activityId")).longValue();
    //     }
    
    //     if (requestBody.get("taskId") != null) {
    //         taskId = ((Number) requestBody.get("taskId")).longValue();
    //     }
    
    //     LikeType type = LikeType.valueOf((String) requestBody.get("type"));
    
    //     System.out.println("📌 파싱된 데이터 - activityId: " + activityId + ", taskId: " + taskId + ", type: " + type);
    
    //     if ((activityId != null && taskId != null) || (activityId == null && taskId == null)) {
    //         throw new IllegalArgumentException("activityId와 taskId 중 하나만 제공해야 합니다.");
    //     }
    
    //     boolean liked = likeService.toggleReaction(
    //             userService.findByEmail(email).get().getId(),
    //             activityId, taskId, type
    //     );
    //     return ResponseEntity.ok(Map.of("liked", liked));
    // }

    @PostMapping("/toggle")
public ResponseEntity<Map<String, Boolean>> toggleLike(
        @RequestBody Map<String, Object> requestBody,
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        Authentication authentication) {

    System.out.println("📌 요청된 데이터: " + requestBody); // 프론트에서 보낸 JSON 확인

    String email = authentication.getName();
    System.out.println("✅ 인증된 사용자: " + email);

    // 🛠 null 체크 후 변환 (NPE 방지)
    Long activityId = requestBody.get("activityId") != null ? ((Number) requestBody.get("activityId")).longValue() : null;
    Long taskId = requestBody.get("taskId") != null ? ((Number) requestBody.get("taskId")).longValue() : null;
    
    // 🔹 LikeType 변환 전 `null` 체크
    String typeStr = (String) requestBody.get("type");
    if (typeStr == null) {
        return ResponseEntity.badRequest().body(Map.of("liked", false));
    }
    
    LikeType type;
    try {
        type = LikeType.valueOf(typeStr);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("liked", false));
    }

    System.out.println("📌 파싱된 데이터 - activityId: " + activityId + ", taskId: " + taskId + ", type: " + type);

    if ((activityId != null && taskId != null) || (activityId == null && taskId == null)) {
        return ResponseEntity.badRequest().body(Map.of("liked", false));
    }

    boolean liked = likeService.toggleReaction(
            userService.findByEmail(email).get().getId(),
            activityId, taskId, type
    );
    return ResponseEntity.ok(Map.of("liked", liked));
}

    @GetMapping("/{activityId}/count")
    public ResponseEntity<Map<String, Integer>> getActivityReactionCounts(@PathVariable Long activityId) {
        return ResponseEntity.ok(likeService.getReactionCounts(activityId, null)); // ✅ 오류 해결
    }

    @GetMapping("/task/{taskId}/count")
    public ResponseEntity<Map<String, Integer>> getTaskReactionCounts(@PathVariable Long taskId) {
        return ResponseEntity.ok(likeService.getReactionCounts(null, taskId)); // ✅ 오류 해결
    }

}
