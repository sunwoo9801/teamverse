package org.zerock.teamverse.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.ProjectRepository;
import org.zerock.teamverse.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectServiceImpl implements ProjectService {  // ✅ 기존 기능 유지하면서 구현

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<Project> getProjectsByUser(User user) {
        return projectRepository.findByUser(user);
    }

    @Override
    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    @Override
    @Transactional
    public Project createProjectForUser(Project project, User user) {
        project.setOwner(user);
        return projectRepository.save(project);
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

    // ✅ 초대 기능 추가
    @Override
    @Transactional
    public void inviteUserToProject(Project project, User invitedUser) {
        project.getTeamMembers().add(invitedUser);
        projectRepository.save(project);
        System.out.println("✅ 초대 완료: " + invitedUser.getEmail() + " 님이 " + project.getName() + " 프로젝트에 초대되었습니다.");
    }
}
