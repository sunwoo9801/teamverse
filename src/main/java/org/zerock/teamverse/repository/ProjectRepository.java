/* 데이터베이스와의 상호작용 담당, 특정 조건의 데이터를 조회할 수 있음음 */

package org.zerock.teamverse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.teamverse.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    // 특정 팀의 프로젝트를 조회하는 메서드
    List<Project> findByTeamId(Long teamId);
}
