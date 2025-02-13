package org.zerock.teamverse.service;

import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.User;

import java.util.List;
import java.util.Optional;

public interface ProjectService {
    List<Project> getProjectsByUser(User user);

    Optional<Project> getProjectById(Long id);

    Project createProjectForUser(Project project, User user);

    Project createProject(Project project);

    List<Project> getAllProjects();

    Project updateProject(Long id, Project projectDetails);

    void deleteProject(Long id);

    // ✅ 초대 기능 추가
    void inviteUserToProject(Project project, User invitedUser);

    List<Project> getProjectsByOwner(User owner); // owner_id 기준으로 가져오기
}