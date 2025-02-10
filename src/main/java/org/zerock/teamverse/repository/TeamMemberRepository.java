package org.zerock.teamverse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.teamverse.entity.TeamMember;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
}
