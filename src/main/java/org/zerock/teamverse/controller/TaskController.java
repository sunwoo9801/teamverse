package org.zerock.teamverse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication; // Authentication import 추가
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.dto.ActivityLogDTO;
import org.zerock.teamverse.dto.TaskDTO;
import org.zerock.teamverse.entity.FileInfo;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.Task;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.FileInfoRepository;
import org.zerock.teamverse.service.ActivityLogService;
import org.zerock.teamverse.service.ProjectService;
import org.zerock.teamverse.service.TaskService;
import org.zerock.teamverse.service.UserService;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/tasks")
public class TaskController {

  private final TaskService taskService;
  private final ProjectService projectService;
  private final UserService userService;
  private final FileInfoRepository fileInfoRepository; // 추가
  private final ActivityLogService activityLogService; // activityLogService 선언 추가

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  public TaskController(TaskService taskService, ProjectService projectService, UserService userService,
      FileInfoRepository fileInfoRepository, ActivityLogService activityLogService) { // activityLogService 주입 추가
    this.taskService = taskService;
    this.projectService = projectService;
    this.userService = userService;
    this.fileInfoRepository = fileInfoRepository;
    this.activityLogService = activityLogService; // activityLogService 할당 추가
  }

  @PostMapping
  public ResponseEntity<Task> createTask(@RequestBody TaskDTO taskDTO) {
      Project project = projectService.getProjectById(taskDTO.getProjectId())
          .orElseThrow(() -> new IllegalArgumentException("Invalid project ID"));
  
      User assignedUser = null;
      if (taskDTO.getAssignedTo() != null) {
          assignedUser = userService.findById(taskDTO.getAssignedTo())
              .orElseThrow(() -> new IllegalArgumentException("Invalid assigned user ID"));
      }
  
      // DTO → Task 엔티티 변환
      Task task = new Task();
      task.setName(taskDTO.getName());
      task.setDescription(taskDTO.getDescription() != null ? taskDTO.getDescription() : "");
      task.setStartDate(taskDTO.getStartDate());
      task.setDueDate(taskDTO.getDueDate());
      task.setStatus(Task.Status.valueOf(taskDTO.getStatus()));
      task.setProject(project);
      task.setAssignedTo(assignedUser);
      task.setColor(taskDTO.getColor());
  
      // Task 저장 (activity_log에는 저장 X)
      Task createdTask = taskService.createTask(task);
  
      return ResponseEntity.ok(createdTask);
  }
    
  // 프로젝트 ID로 작업 조회 API
  @GetMapping
  public ResponseEntity<List<TaskDTO>> getTasksByProjectId(@RequestParam Long projectId) {
    List<TaskDTO> tasks = taskService.getTasksByProjectId(projectId)
        .stream()
        .map(TaskDTO::new)
        .collect(Collectors.toList());
    return ResponseEntity.ok(tasks);
  }

  // Task ID로 작업 조회 API
  @GetMapping("/{id}")
  public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
    Task task = taskService.getTaskById(id)
        .orElseThrow(() -> new RuntimeException("Task not found"));
    return ResponseEntity.ok(new TaskDTO(task));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody TaskDTO taskDTO) {
    Project project = projectService.getProjectById(taskDTO.getProjectId())
        .orElseThrow(() -> new IllegalArgumentException("Invalid project ID"));

    User assignedUser = null;
    if (taskDTO.getAssignedTo() != null) {
      assignedUser = userService.findById(taskDTO.getAssignedTo())
          .orElseThrow(() -> new IllegalArgumentException("Invalid assigned user ID"));
    }

    // 기존 Task 정보 가져와 업데이트
    Task updatedTask = taskService.updateTask(id, taskDTO, project, assignedUser);

    messagingTemplate.convertAndSend("/topic/tasks", updatedTask);
    return ResponseEntity.ok(updatedTask);
  }

  // Task 삭제 API
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
    taskService.deleteTask(id);
    messagingTemplate.convertAndSend("/topic/tasks/delete", id); // 작업 삭제 이벤트 전송
    return ResponseEntity.noContent().build();
  }

  // 상태별 작업 조회 API
  @GetMapping("/status")
  public ResponseEntity<List<TaskDTO>> getTasksByStatus(@RequestParam Task.Status status) {
    List<TaskDTO> tasks = taskService.getTasksByStatus(status)
        .stream()
        .map(TaskDTO::new)
        .collect(Collectors.toList());
    return ResponseEntity.ok(tasks);
  }

  // 특정 사용자 작업 조회 API
  @GetMapping("/user/{userId}")
  public ResponseEntity<List<TaskDTO>> getTasksByAssignedUser(@PathVariable Long userId) {
    List<TaskDTO> tasks = taskService.getTasksByAssignedUser(userId)
        .stream()
        .map(TaskDTO::new)
        .collect(Collectors.toList());
    return ResponseEntity.ok(tasks);
  }
}