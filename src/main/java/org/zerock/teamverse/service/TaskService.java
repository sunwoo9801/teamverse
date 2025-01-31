package org.zerock.teamverse.service;

import org.springframework.stereotype.Service;
import org.zerock.teamverse.entity.Task;
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

    public Task updateTask(Long id, Task taskDetails) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setName(taskDetails.getName());
        task.setStatus(taskDetails.getStatus());
        task.setDueDate(taskDetails.getDueDate());
        task.setUpdatedAt(taskDetails.getUpdatedAt());
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
