package org.zerock.teamverse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.dto.TaskDTO;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.Task;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.service.ProjectService;
import org.zerock.teamverse.service.TaskService;
import org.zerock.teamverse.service.UserService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/tasks")
public class TaskController {

  private final TaskService taskService;
  private final ProjectService projectService;
  private final UserService userService;

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  public TaskController(TaskService taskService, ProjectService projectService, UserService userService) {
    this.taskService = taskService;
    this.projectService = projectService;
    this.userService = userService;
  }

  // Task 생성 API
  @PostMapping
  public ResponseEntity<Task> createTask(@RequestBody TaskDTO taskDTO) {

    // 프로젝트 조회
    Project project = projectService.getProjectById(taskDTO.getProjectId())
        .orElseThrow(() -> new IllegalArgumentException("Invalid project ID"));

    // 담당자 조회
    User assignedUser = null;
    if (taskDTO.getAssignedTo() != null) {
      assignedUser = userService.findById(taskDTO.getAssignedTo())
          .orElseThrow(() -> new IllegalArgumentException("Invalid assigned user ID"));
    }

    // DTO → 엔티티 변환
    Task task = new Task();
    task.setName(taskDTO.getName());
    task.setStatus(Task.Status.valueOf(taskDTO.getStatus()));
    task.setStartDate(taskDTO.getStartDate()); // ✅ 작업 시작일 반영
    task.setDueDate(taskDTO.getDueDate());
    task.setDescription(taskDTO.getDescription()); // ✅ 작업 내용 반영
    task.setProject(project);
    task.setAssignedTo(assignedUser); // ✅ 담당자 설정
    task.setColor(taskDTO.getColor()); // ✅ 색상 값 저장




    Task createdTask = taskService.createTask(task);
    messagingTemplate.convertAndSend("/topic/tasks", createdTask); // 작업 생성 이벤트 전송

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
