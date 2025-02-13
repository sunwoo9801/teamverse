package org.zerock.teamverse.service;

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

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Task createTask(Task task) {
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
}
