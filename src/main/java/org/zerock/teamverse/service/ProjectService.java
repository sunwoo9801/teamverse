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

    public Project updateProject(Long id, Project projectDetails);

    void deleteProject(Long id);

    // ✅ 초대 기능 추가
    void inviteUserToProject(Project project, User invitedUser);

    List<Project> getProjectsByOwner(User owner); // owner_id 기준으로 가져오기

    // ✅ 특정 프로젝트의 팀원 목록 조회
    List<User> getProjectTeamMembers(Long projectId);

    boolean isProjectMember(Long projectId, Long userId);

    boolean leaveProject(Long projectId, User user); // ✅ 프로젝트 나가기 메서드 추가



}