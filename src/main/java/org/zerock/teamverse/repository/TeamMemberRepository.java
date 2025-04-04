package org.zerock.teamverse.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.TeamMember;
import org.zerock.teamverse.entity.User;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
  // 특정 프로젝트에 속한 모든 팀원 조회
  List<TeamMember> findByProject_Id(Long projectId);

  // 특정 프로젝트에 속한 모든 사용자(User) 조회
  List<User> findUsersByProject_Id(Long projectId);

  boolean existsByProjectAndUser(Project project, User user); // 특정 프로젝트에 특정 사용자가 이미 속해 있는지 확인

  // 특정 프로젝트에 특정 사용자가 속해 있는지 확인
  boolean existsByProject_IdAndUser_Id(Long projectId, Long userId);

  // 특정 프로젝트에서 특정 사용자를 제거하는 기능 추가
  @Modifying
  @Transactional
  @Query("DELETE FROM TeamMember tm WHERE tm.project = :project AND tm.user = :user")
  void deleteByProjectAndUser(@Param("project") Project project, @Param("user") User user);


  void deleteByProject(Project project);  //  프로젝트 기준으로 팀원 정보 삭제 추가


}
