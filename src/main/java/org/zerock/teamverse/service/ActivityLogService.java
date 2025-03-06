package org.zerock.teamverse.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.teamverse.dto.ActivityLogDTO;
import org.zerock.teamverse.entity.ActivityLog;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.Task;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.ActivityLogRepository;
import org.zerock.teamverse.repository.LikeRepository;
import org.zerock.teamverse.repository.ProjectRepository;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final ProjectRepository projectRepository;
    private final LikeRepository likeRepository; // 리액션 개수 조회 추가
    private final SimpMessagingTemplate messagingTemplate;

    private static final ObjectMapper objectMapper = new ObjectMapper(); // 🔵 JSON 변환 객체

    public ActivityLogService(ActivityLogRepository activityLogRepository, ProjectRepository projectRepository,
            LikeRepository likeRepository, SimpMessagingTemplate messagingTemplate) {
        this.activityLogRepository = activityLogRepository;
        this.projectRepository = projectRepository;
        this.likeRepository = likeRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // 특정 프로젝트의 활동 로그 가져오기 (DTO 변환 포함)
    public List<ActivityLogDTO> getActivityLogsByProjectId(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));

        List<ActivityLog> logs = activityLogRepository.findByProjectOrderByCreatedAtDesc(project);

        return logs.stream()
                .map(log -> {
                    Map<String, Integer> reactionCounts = likeRepository.getReactionCountsByActivity(log.getId());
                    return new ActivityLogDTO(log, reactionCounts);
                })
                .collect(Collectors.toList());
    }

    // 사용자의 활동 로그 조회
    public List<ActivityLog> getUserActivityLogs(Long userId) {
        return activityLogRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    // 새로운 활동 로그 저장 후 WebSocket으로 브로드캐스트
    @Transactional
    public ActivityLog createActivityLog(ActivityLog activityLog) {
        ActivityLog savedLog = activityLogRepository.save(activityLog);

        // 🔹 WebSocket을 통해 클라이언트에게 새로운 활동 로그 전송
        messagingTemplate.convertAndSend("/topic/feed/" + savedLog.getProject().getId(), savedLog);

        return savedLog;
    }

    // 업무(Task) 생성 시 피드에 기록
    // public ActivityLog logTaskCreation(User user, Task task) {
    // String description = user.getUsername() + "님이 새로운 업무를 등록했습니다: " +
    // task.getName();

    // ActivityLog activityLog = new ActivityLog();
    // activityLog.setUser(user);
    // activityLog.setProject(task.getProject()); // Task에서 Project 가져오기
    // activityLog.setActivityType("TASK_CREATED");
    // activityLog.setActivityDescription(description);

    // return activityLogRepository.save(activityLog);
    // }

    // Task 생성 시 로그 기록 (파일 포함)
    @Transactional
    public ActivityLogDTO logTaskCreation(User user, Task task, List<String> files) {
        ActivityLog activityLog = new ActivityLog();
        activityLog.setUser(user);
        activityLog.setProject(task.getProject());
        activityLog.setActivityType("TASK");

        Map<String, String> descriptionMap = new HashMap<>();
        descriptionMap.put("title", task.getName());
        descriptionMap.put("content", task.getDescription() != null ? task.getDescription() : "");

        try {
            activityLog.setActivityDescription(objectMapper.writeValueAsString(descriptionMap));
        } catch (Exception e) {
            activityLog.setActivityDescription(
                    task.getName() + "\n" + (task.getDescription() != null ? task.getDescription() : ""));
        }

        activityLog = activityLogRepository.save(activityLog);

        Map<String, Integer> reactionCounts = likeRepository.getReactionCountsByActivity(activityLog.getId());
        ActivityLogDTO activityLogDTO = new ActivityLogDTO(activityLog, reactionCounts);
        activityLogDTO.setFiles(files);

        // 🔵 WebSocket을 통해 새로운 피드 전송 (TaskService에서는 전송 안 함)
        messagingTemplate.convertAndSend("/topic/feed/" + task.getProject().getId(), activityLogDTO);

        return activityLogDTO;
    }

    // 새로운 활동 추가
    @Transactional
    public void logActivity(User user, String activityType, String description) {
        ActivityLog log = new ActivityLog();
        log.setUser(user);
        log.setActivityType(activityType);
        log.setActivityDescription(description);
        activityLogRepository.save(log);
    }

    // 게시글 작성 로그 추가 (파일 업로드 포함)
    @Transactional
    public ActivityLogDTO logPostCreation(User user, Project project, String title, String content,
            List<String> files) {
        ActivityLog activityLog = new ActivityLog();
        activityLog.setUser(user);
        activityLog.setProject(project);
        activityLog.setActivityType("POST"); // 🔹 Task가 아닌 POST만 저장
        Map<String, String> descriptionMap = new HashMap<>();
        descriptionMap.put("title", title);
        descriptionMap.put("content", content);

        try {
            activityLog.setActivityDescription(objectMapper.writeValueAsString(descriptionMap));
        } catch (Exception e) {
            activityLog.setActivityDescription(title + "\n" + content);
        }

        activityLog = activityLogRepository.save(activityLog);
        Map<String, Integer> reactionCounts = likeRepository.getReactionCountsByActivity(activityLog.getId());

        ActivityLogDTO activityLogDTO = new ActivityLogDTO(activityLog, reactionCounts);
        activityLogDTO.setFiles(files);

        messagingTemplate.convertAndSend("/topic/feed/" + project.getId(), activityLogDTO);

        return activityLogDTO;
    }
}
