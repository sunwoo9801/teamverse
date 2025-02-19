package org.zerock.teamverse.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.TeamMember;
import org.zerock.teamverse.entity.User;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    // ✅ 특정 프로젝트에 속한 모든 팀원 조회
    List<TeamMember> findByProject_Id(Long projectId);

    // ✅ 특정 프로젝트에 속한 모든 사용자(User) 조회
    List<User> findUsersByProject_Id(Long projectId);

    boolean existsByProjectAndUser(Project project, User user); // ✅ 특정 프로젝트에 특정 사용자가 이미 속해 있는지 확인

}
