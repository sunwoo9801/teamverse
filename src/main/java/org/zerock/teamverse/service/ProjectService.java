package org.zerock.teamverse.service;

import org.springframework.stereotype.Service;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.repository.ProjectRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    // 프로젝트 생성
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    // 모든 프로젝트 조회
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    // ID로 특정 프로젝트 조회
    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    // 프로젝트 수정
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

    // 프로젝트 삭제
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        projectRepository.delete(project);
    }
}
