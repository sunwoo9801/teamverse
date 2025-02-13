package org.zerock.teamverse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.entity.TaskDependency;
import org.zerock.teamverse.service.TaskDependencyService;

import java.util.List;

@RestController
@RequestMapping("/api/user/tasks/dependencies")
public class TaskDependencyController {

    private final TaskDependencyService taskDependencyService;

    public TaskDependencyController(TaskDependencyService taskDependencyService) {
        this.taskDependencyService = taskDependencyService;
    }

    // 특정 작업(Task)의 종속성 조회
    @GetMapping("/{taskId}")
    public ResponseEntity<List<TaskDependency>> getTaskDependencies(@PathVariable Long taskId) {
        List<TaskDependency> dependencies = taskDependencyService.getDependenciesByTaskId(taskId);
        return ResponseEntity.ok(dependencies);
    }

    // 작업 간 의존성 추가
    @PostMapping
    public ResponseEntity<TaskDependency> createDependency(@RequestBody TaskDependency dependency) {
        TaskDependency createdDependency = taskDependencyService.createDependency(dependency);
        return ResponseEntity.ok(createdDependency);
    }

    // 특정 의존성 삭제
    @DeleteMapping("/{dependencyId}")
    public ResponseEntity<Void> deleteDependency(@PathVariable Long dependencyId) {
        taskDependencyService.deleteDependency(dependencyId);
        return ResponseEntity.noContent().build();
    }
}
