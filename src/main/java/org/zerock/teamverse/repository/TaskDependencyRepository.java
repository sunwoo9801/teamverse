package org.zerock.teamverse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.teamverse.entity.TaskDependency;

import java.util.List;

public interface TaskDependencyRepository extends JpaRepository<TaskDependency, Long> {
    List<TaskDependency> findByTaskId(Long taskId);
}
