package org.zerock.teamverse.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.teamverse.entity.Task;
import org.zerock.teamverse.entity.TaskDependency;
import org.zerock.teamverse.repository.TaskDependencyRepository;
import org.zerock.teamverse.repository.TaskRepository;

import java.util.List;

@Service
public class TaskDependencyService {

    private final TaskDependencyRepository taskDependencyRepository;
    private final TaskRepository taskRepository;

    public TaskDependencyService(TaskDependencyRepository taskDependencyRepository, TaskRepository taskRepository) {
        this.taskDependencyRepository = taskDependencyRepository;
        this.taskRepository = taskRepository;
    }

    // 특정 작업(Task)의 의존성 조회
    public List<TaskDependency> getDependenciesByTaskId(Long taskId) {
        return taskDependencyRepository.findByTaskId(taskId);
    }

    // 작업 간 의존성 추가
    @Transactional
    public TaskDependency createDependency(TaskDependency dependency) {
        Task task = taskRepository.findById(dependency.getTask().getId())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Task dependentTask = taskRepository.findById(dependency.getDependentTask().getId())
                .orElseThrow(() -> new RuntimeException("Dependent Task not found"));

        dependency.setTask(task);
        dependency.setDependentTask(dependentTask);

        return taskDependencyRepository.save(dependency);
    }

    // 특정 의존성 삭제
    @Transactional
    public void deleteDependency(Long dependencyId) {
        taskDependencyRepository.deleteById(dependencyId);
    }
}
