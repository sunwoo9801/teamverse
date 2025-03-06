package org.zerock.teamverse.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.TeamMember;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.ProjectRepository;
import org.zerock.teamverse.repository.TeamMemberRepository;
import org.zerock.teamverse.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectServiceImpl implements ProjectService { // ✅ 기존 기능 유지하면서 구현

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository,
            UserRepository userRepository,
            TeamMemberRepository teamMemberRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.teamMemberRepository = teamMemberRepository;
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public List<Project> getProjectsByUser(User user) {
        return projectRepository.findByTeamMembers_User(user);
    }

    @Override
    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    @Override
    @Transactional
    public Project createProjectForUser(Project project, User user) {
        project.setOwner(user);
        project = projectRepository.save(project);

        // ✅ 프로젝트 생성 시 자동으로 생성자를 팀 멤버로 추가
        TeamMember teamMember = new TeamMember();
        teamMember.setProject(project);
        teamMember.setUser(user);
        teamMember.setRole(TeamMember.Role.LEADER); // 프로젝트 생성자는 LEADER 역할

        teamMemberRepository.save(teamMember);

        return project;
    }

    @Override
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    @Override
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Override
    @Transactional
    public Project updateProject(Long id, Project projectDetails) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        project.setName(projectDetails.getName());
        project.setDescription(projectDetails.getDescription());
        project.setStartDate(projectDetails.getStartDate());
        project.setEndDate(projectDetails.getEndDate());
        project.setUpdatedAt(LocalDateTime.now());

        return projectRepository.save(project);
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        projectRepository.delete(project);
    }

    // ✅ 초대 기능 수정
    @Override
    @Transactional
    public void inviteUserToProject(Project project, User invitedUser) {
        // ✅ 기존의 `project.getTeamMembers().add(invitedUser);` 코드 제거
        // ✅ 대신, TeamMember 엔티티를 생성하여 추가
        TeamMember teamMember = new TeamMember();
        teamMember.setProject(project);
        teamMember.setUser(invitedUser);
        teamMember.setRole(TeamMember.Role.MEMBER); // 기본 역할

        teamMemberRepository.save(teamMember);
    }

    @Override
    public List<Project> getProjectsByOwner(User owner) {
        return projectRepository.findByOwner(owner); // owner_id 기반 프로젝트 목록 가져오기
    }

    // ✅ 특정 프로젝트의 팀원 목록 조회
    @Override
    public List<User> getProjectTeamMembers(Long projectId) {
        List<TeamMember> teamMembers = teamMemberRepository.findByProject_Id(projectId);
        return teamMembers.stream().map(TeamMember::getUser).toList();
    }
    @Override
    public boolean isProjectMember(Long projectId, Long userId) {
        boolean exists = teamMemberRepository.existsByProject_IdAndUser_Id(projectId, userId);
        System.out.println("📌 팀원 여부 확인 - 프로젝트 ID: " + projectId + ", 사용자 ID: " + userId + " → " + exists);
        return exists;
    }
    
}
