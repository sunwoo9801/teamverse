package org.zerock.teamverse.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.Task;
import org.zerock.teamverse.service.ProjectService;
import org.zerock.teamverse.service.TaskService;

import java.util.Collections;
import java.util.List;

import org.springframework.security.core.Authentication;

import org.zerock.teamverse.entity.User;

import org.zerock.teamverse.service.UserService;

@RestController // JSON 형식으로 반환
@RequestMapping("/api/user/projects") // url의 시작 부분
public class ProjectController {

    private final ProjectService projectService; // 프로젝트 관련 서비스
    private final TaskService taskService; // 작업(Task) 관련 서비스
    private final UserService userService; // 🔹 UserService 주입 추가

    public ProjectController(ProjectService projectService, TaskService taskService, UserService userService) {
        this.projectService = projectService;
        this.taskService = taskService;
        this.userService = userService;

    }

    // 로그인한 유저의 프로젝트 조회 (초대받은 프로젝트도 포함)
    @GetMapping
    public ResponseEntity<List<Project>> getUserProjects(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.emptyList());
        }

        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 소유한 프로젝트 + 초대된 프로젝트 모두 가져오기
        List<Project> ownedProjects = projectService.getProjectsByOwner(user);
        List<Project> invitedProjects = projectService.getProjectsByUser(user);

        ownedProjects.addAll(invitedProjects); // 리스트 병합

        return ResponseEntity.ok(ownedProjects);
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 현재 로그인한 사용자 가져오기
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // `User` 객체를 함께 전달하여 프로젝트 생성
        Project createdProject = projectService.createProjectForUser(project, currentUser);

        System.out.println("📌 프로젝트 생성 완료: ID = " + createdProject.getId() + ", Name = " + createdProject.getName()); // 로그
                                                                                                                      // 추가

        return ResponseEntity.ok(createdProject);
    }

    // ID로 특정 프로젝트 조회
    // @GetMapping("/{id}")
    // public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
    // Project project = projectService.getProjectById(id) // ID로 프로젝트 찾기
    // .orElseThrow(() -> new RuntimeException("Project not found")); // 없으면 예외 발생
    // return ResponseEntity.ok(project); // 찾은 프로젝트 반환
    // }

    // 특정 프로젝트의 작업(Task) 조회
    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<Task>> getTasksByProjectId(@PathVariable Long id) {
        List<Task> tasks = taskService.getTasksByProjectId(id); // 프로젝트 ID로 작업 조회
        return ResponseEntity.ok(tasks); // 작업 리스트 반환
    }

    // 프로젝트 수정
    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(
            @PathVariable Long id,
            @RequestBody Project projectDetails,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 현재 로그인한 사용자 가져오기
        String email = authentication.getName();
        User currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 프로젝트 존재 여부 확인
        Project project = projectService.getProjectById(id)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));

        // 사용자가 프로젝트의 소유자인지 확인
        if (!project.getOwner().equals(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null); // 🚨 소유자가 아니면 수정 불가
        }

        // 프로젝트 정보 업데이트
        Project updatedProject = projectService.updateProject(id, projectDetails);
        return ResponseEntity.ok(updatedProject);
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

    // 특정 프로젝트에 속한 팀원 목록 반환
    @GetMapping("/{projectId}/team-members")
    public ResponseEntity<List<User>> getProjectTeamMembers(@PathVariable Long projectId) {
        List<User> teamMembers = projectService.getProjectTeamMembers(projectId);
        return ResponseEntity.ok(teamMembers);
    }

    // 특정 프로젝트 조회 (팀원만 접근 가능하도록 수정)
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Project project = projectService.getProjectById(id)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));

        // 해당 사용자가 프로젝트 팀원인지 확인
        boolean isMember = projectService.isProjectMember(project.getId(), user.getId());
        System.out.println("[" + user.getEmail() + "] 사용자가 프로젝트 [" + project.getName() + "]의 팀원인가? " + isMember);

        if (!isMember) {
            System.out.println("🚨 접근 거부됨: " + user.getEmail() + "는 프로젝트 [" + project.getName() + "]의 팀원이 아님!");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{projectId}/leave")
    public ResponseEntity<String> leaveProject(@PathVariable Long projectId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        boolean success = projectService.leaveProject(projectId, user);

        if (success) {
            return ResponseEntity.ok("프로젝트에서 성공적으로 나갔습니다.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("프로젝트에서 나갈 수 없습니다.");
        }
    }

}
