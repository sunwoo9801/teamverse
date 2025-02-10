package org.zerock.teamverse.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.Task;
import org.zerock.teamverse.service.ProjectService;
import org.zerock.teamverse.service.TaskService;

import java.util.List;

import org.springframework.security.core.Authentication;

import org.zerock.teamverse.entity.User;

import org.zerock.teamverse.service.UserService;



@RestController//JSON 형식으로 반환
@RequestMapping("/api/user/projects") //url의 시작 부분
public class ProjectController {

    private final ProjectService projectService; // 프로젝트 관련 서비스
    private final TaskService taskService; // 작업(Task) 관련 서비스
    private final UserService userService; // 🔹 UserService 주입 추가


    public ProjectController(ProjectService projectService, TaskService taskService, UserService userService) {
        this.projectService = projectService;
        this.taskService = taskService;
        this.userService = userService;

    }

    // ✅ 로그인한 유저의 프로젝트만 조회
    @GetMapping
    public ResponseEntity<List<Project>> getUserProjects(Authentication authentication) {
        String email = authentication.getName(); // 현재 로그인한 사용자의 이메일 가져오기
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Project> projects = projectService.getProjectsByUser(user);
        return ResponseEntity.ok(projects);
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    
        // ✅ 현재 로그인한 사용자 가져오기
        User currentUser = userService.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
    
        // ✅ `User` 객체를 함께 전달하여 프로젝트 생성
        Project createdProject = projectService.createProjectForUser(project, currentUser);
        
        return ResponseEntity.ok(createdProject);
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

    @PostMapping("/{id}/invite")
    public ResponseEntity<String> inviteUserToProject(@PathVariable Long id, 
                                                      @RequestBody String email, 
                                                      Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
    
        String currentUserEmail = authentication.getName();
        User currentUser = userService.findByEmail(currentUserEmail)
            .orElseThrow(() -> new RuntimeException("로그인된 사용자를 찾을 수 없습니다."));
    
        Project project = projectService.getProjectById(id)
            .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));
    
        User invitedUser = userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("초대할 사용자를 찾을 수 없습니다."));
    
        projectService.inviteUserToProject(project, invitedUser);
    
        return ResponseEntity.ok("초대가 성공적으로 전송되었습니다.");
    }
    
}
