package org.zerock.teamverse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.teamverse.entity.Invite;
import org.zerock.teamverse.entity.Invite.InviteStatus;
import org.zerock.teamverse.entity.User;

import java.util.List;

public interface InviteRepository extends JpaRepository<Invite, Long> {
    // List<Invite> findByReceiver(User receiver); // 사용자가 받은 초대 조회
    // List<Invite> findByReceiverAndStatus(User receiver, InviteStatus status); // ✅ PENDING 상태만 가져오기
    // ✅ 수락되지 않은 초대만 가져오기
    List<Invite> findByReceiverAndStatus(User receiver, Invite.InviteStatus status);


}
