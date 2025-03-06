package org.zerock.teamverse.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.teamverse.dto.TaskDTO;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.Task;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.TaskRepository;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final SimpMessagingTemplate messagingTemplate; // ✅ WebSocket 브로드캐스트 추가

    public TaskService(TaskRepository taskRepository, SimpMessagingTemplate messagingTemplate) {
        this.taskRepository = taskRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Task createTask(Task task) {

        if (task.getColor() == null || task.getColor().isEmpty()) {
            System.out.println("❌ [TaskService] color 값이 없음, 기본 색상 적용");
            task.setColor("#ff99a5");
        }

        if (task.getDescription() == null || task.getDescription().trim().isEmpty()) {
            task.setDescription(""); // ✅ NULL 또는 빈 값 방지
        }

        Task savedTask = taskRepository.save(task);

        return taskRepository.save(task);
    }

    public List<Task> getTasksByProjectId(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    @Transactional
    public Task updateTask(Long id, TaskDTO taskDTO, Project project, User assignedUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setName(taskDTO.getName());
        task.setStatus(Task.Status.valueOf(taskDTO.getStatus()));
        task.setStartDate(taskDTO.getStartDate()); // ✅ 작업 시작일 업데이트
        task.setDueDate(taskDTO.getDueDate());
        task.setDescription(taskDTO.getDescription()); // ✅ 작업 내용 업데이트
        task.setProject(project);
        task.setAssignedTo(assignedUser);
        task.setColor(taskDTO.getColor()); // ✅ 색상 값 저장

        // ✅ color 값이 정상적으로 들어오는지 로그 확인
        System.out.println("📌 전달받은 TaskDTO color: " + taskDTO.getColor());
        if (taskDTO.getColor() == null || taskDTO.getColor().isEmpty()) {
            System.out.println("❌ color 값이 없음, 기본 색상 적용");
            task.setColor("#ff99a5");
        } else {
            System.out.println("✅ 저장할 color 값: " + taskDTO.getColor());
            task.setColor(taskDTO.getColor());
        }

        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        taskRepository.delete(task);
    }

    // 상태별 작업 조회
    public List<Task> getTasksByStatus(Task.Status status) {
        return taskRepository.findByStatus(status); // 상태에 따라 작업 필터링
    }

    // 특정 사용자 작업 조회
    public List<Task> getTasksByAssignedUser(Long userId) {
        return taskRepository.findByAssignedTo_Id(userId); // 사용자 ID로 작업 필터링
    }

    public boolean existsByNameAndProject(String name, Project project) {
        return taskRepository.existsByNameAndProject(name, project);
    }
    
}
