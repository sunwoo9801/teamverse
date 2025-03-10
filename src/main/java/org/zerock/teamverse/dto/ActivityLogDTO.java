package org.zerock.teamverse.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.zerock.teamverse.entity.ActivityLog;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
public class ActivityLogDTO {
    private Long id;
    private String title; // 게시글 제목
    private String content; // 게시글 내용
    private String activityType;
    private LocalDateTime createdAt;
    private Long userId;
    private String username; // 사용자명 추가
    private String profileImage; // 프로필 이미지 추가
    private Map<String, Integer> reactionCounts; // 리액션 개수 추가
    private List<String> files; // 파일 리스트 추가

    // 🔵 JSON 처리 객체 추가
    private static final ObjectMapper objectMapper = new ObjectMapper();

    // ActivityLog 엔티티에서 DTO로 변환하는 생성자
    public ActivityLogDTO(ActivityLog activityLog, Map<String, Integer> reactionCounts) {
        this.id = activityLog.getId();
        this.activityType = activityLog.getActivityType();
        this.createdAt = activityLog.getCreatedAt();
        this.userId = activityLog.getUser().getId();
        this.username = activityLog.getUser().getUsername();
        this.profileImage = activityLog.getUser().getProfileImage();
        this.reactionCounts = reactionCounts != null ? reactionCounts : new HashMap<>();

        if ("POST".equals(activityLog.getActivityType())) {
            try {
                Map<String, String> descriptionMap = objectMapper.readValue(activityLog.getActivityDescription(),
                        Map.class);
                this.title = descriptionMap.getOrDefault("title", "제목 없음");
                this.content = descriptionMap.getOrDefault("content", "내용 없음");
            } catch (Exception e) {
                this.title = "제목 없음";
                this.content = activityLog.getActivityDescription();
            }
        } else {
            this.title = null;
            this.content = activityLog.getActivityDescription();
        }
        // 파일 정보 저장 (중복 제거)
        if (activityLog.getFiles() != null) {
            this.files = activityLog.getFiles().stream()
                    .map(file -> file.getFileUrl()) // 파일 URL만 저장
                    .distinct() // 중복 제거
                    .collect(Collectors.toList());
        } else {
            this.files = new ArrayList<>();
        }
    }
}
