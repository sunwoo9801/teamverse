package org.zerock.teamverse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.teamverse.entity.ActivityLog;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.User;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    
    // 특정 사용자의 활동 로그를 최신순으로 가져오기
    List<ActivityLog> findByUser_IdOrderByCreatedAtDesc(Long userId);
  // 기존의 projectId가 아닌 project 엔티티를 기준으로 검색
    List<ActivityLog> findByProject(Project project);

     // 특정 프로젝트의 모든 활동 로그 (TASK + POST 포함)
     List<ActivityLog> findByProjectOrderByCreatedAtDesc(Project project);

     boolean existsByActivityTypeAndProjectAndUser(String activityType, Project project, User user);

     void deleteByProject(Project project);

     
}
/* 데이터베이스와의 상호작용 담당, 특정 조건의 데이터를 조회할 수 있음음 */

