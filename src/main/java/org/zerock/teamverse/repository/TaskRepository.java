/* 데이터베이스와의 상호작용 담당, 특정 조건의 데이터를 조회할 수 있음음 */

package org.zerock.teamverse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.teamverse.entity.Task;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);

    List<Task> findByStatus(Task.Status status); // 상태별 작업 조회

    List<Task> findByAssignedTo_Id(Long userId); // 특정 사용자 작업 조회
}
