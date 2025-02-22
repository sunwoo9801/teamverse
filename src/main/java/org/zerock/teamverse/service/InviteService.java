package org.zerock.teamverse.service;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.teamverse.entity.Invite;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.TeamMember;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.InviteRepository;
import org.zerock.teamverse.repository.ProjectRepository;
import org.zerock.teamverse.repository.TeamMemberRepository;

@Service
public class InviteService {

    private final InviteRepository inviteRepository;
    private final ProjectRepository projectRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final SimpMessagingTemplate messagingTemplate; // ✅ WebSocket 메시징을 위한 템플릿 추가



    public InviteService(InviteRepository inviteRepository, ProjectRepository projectRepository, TeamMemberRepository teamMemberRepository, SimpMessagingTemplate messagingTemplate) {
        this.inviteRepository = inviteRepository;
        this.projectRepository = projectRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.messagingTemplate = messagingTemplate;

    }

    // ✅ 초대 생성 및 반환
    @Transactional
    public Invite createInvite(User sender, User receiver, Project project) {
        Invite invite = new Invite();
        invite.setSender(sender);
        invite.setReceiver(receiver);
        invite.setProject(project);
        invite.setStatus(Invite.InviteStatus.PENDING);

        inviteRepository.save(invite); // ✅ DB에 저장
        return invite; // ✅ 초대 객체 반환
    }

    // ✅ 초대 수락
    @Transactional
    public Invite acceptInvite(Long inviteId) {
        Invite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("초대를 찾을 수 없습니다."));

        invite.setStatus(Invite.InviteStatus.ACCEPTED); // ✅ 초대 상태 변경
        inviteRepository.save(invite);

        // ✅ 팀 멤버 추가 (이미 존재하는지 확인 후 추가)
        boolean alreadyMember = teamMemberRepository.existsByProjectAndUser(invite.getProject(), invite.getReceiver());
        if (!alreadyMember) {
            TeamMember teamMember = new TeamMember();
            teamMember.setProject(invite.getProject());
            teamMember.setUser(invite.getReceiver());
            teamMember.setRole(TeamMember.Role.MEMBER);
            teamMemberRepository.save(teamMember);
        }

        return invite; // ✅ 초대 객체 반환
    }
    

    public List<Invite> getUserInvites(User receiver) {
        // return inviteRepository.findByReceiver(receiver);
        return inviteRepository.findByReceiverAndStatus(receiver, Invite.InviteStatus.PENDING); // ✅ PENDING 상태만 조회

    }

}
