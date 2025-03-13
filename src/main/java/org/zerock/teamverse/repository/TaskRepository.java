package org.zerock.teamverse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.Task;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);

    List<Task> findByStatus(Task.Status status); // 상태별 작업 조회

    List<Task> findByAssignedTo_Id(Long userId); // 특정 사용자 작업 조회

    boolean existsByNameAndProject(String name, Project project);

}