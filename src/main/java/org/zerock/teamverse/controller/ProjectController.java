package org.zerock.teamverse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.Task;
import org.zerock.teamverse.service.ProjectService;
import org.zerock.teamverse.service.TaskService;

import java.util.List;

@RestController//JSON 형식으로 반환
@RequestMapping("/api/user/projects") //url의 시작 부분
public class ProjectController {

    private final ProjectService projectService; // 프로젝트 관련 서비스
    private final TaskService taskService; // 작업(Task) 관련 서비스

    public ProjectController(ProjectService projectService, TaskService taskService) {
        this.projectService = projectService;
        this.taskService = taskService;
    }

    // 프로젝트 생성
    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        Project createdProject = projectService.createProject(project); // 서비스로 프로젝트 생성
        return ResponseEntity.ok(createdProject); // 생성된 프로젝트 반환
    }

    // 모든 프로젝트 조회
    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects(); // 서비스에서 모든 프로젝트 가져옴
        return ResponseEntity.ok(projects); // 프로젝트 리스트 반환
    }

    // ID로 특정 프로젝트 조회
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        Project project = projectService.getProjectById(id) // ID로 프로젝트 찾기
                .orElseThrow(() -> new RuntimeException("Project not found")); // 없으면 예외 발생
        return ResponseEntity.ok(project); // 찾은 프로젝트 반환
    }

    // 특정 프로젝트의 작업(Task) 조회
    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<Task>> getTasksByProjectId(@PathVariable Long id) {
        List<Task> tasks = taskService.getTasksByProjectId(id); // 프로젝트 ID로 작업 조회
        return ResponseEntity.ok(tasks); // 작업 리스트 반환
    }

    // 프로젝트 수정
    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project projectDetails) {
        Project updatedProject = projectService.updateProject(id, projectDetails); // 프로젝트 수정
        return ResponseEntity.ok(updatedProject); // 수정된 프로젝트 반환
    }

    // 프로젝트 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id); // ID로 프로젝트 삭제
        return ResponseEntity.noContent().build(); // 삭제 후 응답 본문 없음
    }
}
