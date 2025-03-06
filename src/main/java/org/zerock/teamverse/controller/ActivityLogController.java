package org.zerock.teamverse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.dto.ActivityLogDTO; //  DTO 추가
import org.zerock.teamverse.entity.ActivityLog;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.Task;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.ProjectRepository;
import org.zerock.teamverse.service.ActivityLogService;
import org.zerock.teamverse.service.TaskService;
import org.zerock.teamverse.service.UserService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/activity")
public class ActivityLogController {
    private final ActivityLogService activityLogService;
    private final UserService userService;
    private final ProjectRepository projectRepository; // 추가
    private final TaskService taskService; // ✅ Task 서비스 추가

    public ActivityLogController(ActivityLogService activityLogService,
            UserService userService,
            ProjectRepository projectRepository, TaskService taskService) { // 생성자 주입
        this.activityLogService = activityLogService;
        this.userService = userService;
        this.projectRepository = projectRepository; // 추가
        this.taskService = taskService;
    }

    // 로그인한 사용자의 활동 피드 가져오기
    @GetMapping("/feed")
    public ResponseEntity<List<ActivityLog>> getUserActivityFeed(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ActivityLog> activityLogs = activityLogService.getUserActivityLogs(user.getId());
        return ResponseEntity.ok(activityLogs);
    }

    // 특정 프로젝트의 활동 로그 가져오기
    @GetMapping("/feed/{projectId}")
    public ResponseEntity<List<ActivityLogDTO>> getActivityFeedByProject(@PathVariable Long projectId) {
        List<ActivityLogDTO> activityLogDTOs = activityLogService.getActivityLogsByProjectId(projectId);
        return ResponseEntity.ok(activityLogDTOs);
    }

    // 업무(Task) 생성 시 피드에 기록
    // @PostMapping("/task")
    // public ResponseEntity<ActivityLog> logTaskCreation(@RequestBody Task task, Authentication authentication) {
    //     String email = authentication.getName();
    //     User user = userService.findByEmail(email)
    //             .orElseThrow(() -> new RuntimeException("User not found"));

    //     ActivityLog activityLog = activityLogService.logTaskCreation(user, task);
    //     return ResponseEntity.ok(activityLog);
    // }


    @PostMapping("/task")
public ResponseEntity<ActivityLogDTO> logTaskCreation(@RequestBody Map<String, Object> requestBody, Authentication authentication) {
    String email = authentication.getName();
    User user = userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    // ✅ Task 객체 생성
    Task task = new Task();
    task.setName(requestBody.get("name").toString());
    task.setDescription(requestBody.get("description") != null ? requestBody.get("description").toString() : "");
    task.setStartDate(java.time.LocalDate.parse(requestBody.get("startDate").toString()));
    task.setDueDate(java.time.LocalDate.parse(requestBody.get("dueDate").toString()));
    task.setStatus(Task.Status.valueOf(requestBody.get("status").toString()));

    // ✅ 프로젝트 설정
    Long projectId = Long.parseLong(requestBody.get("projectId").toString());
    Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));
    task.setProject(project);

    // ✅ 파일 리스트 변환
    List<String> fileUrls = new ArrayList<>();
    if (requestBody.containsKey("files")) {
        Object filesObj = requestBody.get("files");
        if (filesObj instanceof List<?>) {
            fileUrls = ((List<?>) filesObj).stream()
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }
    }

    // ✅ 수정된 메서드 사용 (파일 리스트 포함)
    ActivityLogDTO activityLogDTO = activityLogService.logTaskCreation(user, task, fileUrls);

    return ResponseEntity.ok(activityLogDTO);
}

    // // 글 작성 시 피드에 기록하는 API 추가
    // @Transactional
    // @PostMapping("/post")
    // public ResponseEntity<ActivityLogDTO> logPostCreation(
    //         @RequestBody Map<String, Object> requestBody,
    //         Authentication authentication) {

    //     String email = authentication.getName();
    //     User user = userService.findByEmail(email)
    //             .orElseThrow(() -> new RuntimeException("User not found"));
    //     // String 변환
    //     String title = requestBody.get("title").toString();
    //     String content = requestBody.get("content").toString();

    //     if (title == null || title.trim().isEmpty() || content == null || content.trim().isEmpty()) {
    //         return ResponseEntity.badRequest().build();
    //     }

    //     Long projectId;
    //     try {
    //         projectId = Long.valueOf(requestBody.get("projectId").toString());
    //     } catch (Exception e) {
    //         return ResponseEntity.badRequest().build(); // 🚨 projectId 변환 실패 시 400 응답
    //     }

    //     Project project = projectRepository.findById(projectId)
    //             .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));

    //     // `files` 필드를 List<String>으로 변환
    //     List<String> fileUrls = new ArrayList<>();
    //     if (requestBody.containsKey("files")) {
    //         Object filesObj = requestBody.get("files");
    //         if (filesObj instanceof List<?>) { // List<?> 타입인지 확인 후 변환
    //             fileUrls = ((List<?>) filesObj).stream()
    //                     .map(Object::toString) // Object → String 변환
    //                     .collect(Collectors.toList());
    //         }
    //     }

    //     // 수정된 메서드 사용 (title, content, files 함께 전달)
    //     ActivityLogDTO activityLogDTO = activityLogService.logPostCreation(user, project, title, content, fileUrls);

    //     return ResponseEntity.ok(activityLogDTO);
    // }

    @Transactional
    @PostMapping("/post")
    public ResponseEntity<ActivityLogDTO> logPostCreation(
            @RequestBody Map<String, Object> requestBody,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ Null 체크 및 안전한 변환 (예외 방지)
        String title = requestBody.get("title") != null ? requestBody.get("title").toString() : "";
        String content = requestBody.get("content") != null ? requestBody.get("content").toString() : "";

        if (title.trim().isEmpty() || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build(); // 🚨 제목과 내용이 비어있으면 400 반환
        }

        Long projectId;
        try {
            projectId = Long.parseLong(requestBody.get("projectId").toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build(); // 🚨 projectId 변환 실패 시 400 응답
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));

        // ✅ `files` 필드를 List<String>으로 변환
        List<String> fileUrls = new ArrayList<>();
        if (requestBody.containsKey("files")) {
            Object filesObj = requestBody.get("files");
            if (filesObj instanceof List<?>) { // List 타입인지 확인 후 변환
                fileUrls = ((List<?>) filesObj).stream()
                        .map(Object::toString) // Object → String 변환
                        .collect(Collectors.toList());
            }
        }

        // ✅ 수정된 메서드 사용 (title, content, files 함께 전달)
        ActivityLogDTO activityLogDTO = activityLogService.logPostCreation(user, project, title, content, fileUrls);

        return ResponseEntity.ok(activityLogDTO);
    }

    

}