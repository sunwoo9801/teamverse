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

    // ✅ 초대 생성 및 WebSocket 전송
    @Transactional
    public void createInvite(User sender, User receiver, Project project) {
        Invite invite = new Invite();
        invite.setSender(sender);
        invite.setReceiver(receiver);
        invite.setProject(project);
        invite.setStatus(Invite.InviteStatus.PENDING);
        inviteRepository.save(invite);

        // ✅ WebSocket을 통해 초대 알림 전송
        // messagingTemplate.convertAndSend("/topic/invites/" + receiver.getEmail(), invite);
        // ✅ WebSocket을 통해 초대 알림 전송
        messagingTemplate.convertAndSend("/topic/invites", invite); // ✅ 수정: 이메일 없이 브로드캐스트// ✅ PENDING 상태의 초대 알림 전송

    }

    // ✅ 초대 수락
    @Transactional
    public void acceptInvite(Long inviteId) {
        Invite invite = inviteRepository.findById(inviteId)
          .orElseThrow(() -> new RuntimeException("초대를 찾을 수 없습니다."));

        invite.setStatus(Invite.InviteStatus.ACCEPTED);

        // ✅ 프로젝트 멤버로 추가 (이미 존재하는지 확인 후 추가)
        boolean alreadyMember = teamMemberRepository.existsByProjectAndUser(invite.getProject(), invite.getReceiver());

        if (!alreadyMember) {
            TeamMember teamMember = new TeamMember();
            teamMember.setProject(invite.getProject());
            teamMember.setUser(invite.getReceiver());
            teamMember.setRole(TeamMember.Role.MEMBER);
            teamMemberRepository.save(teamMember);
        }

        inviteRepository.save(invite);
    }

    public List<Invite> getUserInvites(User receiver) {
        return inviteRepository.findByReceiver(receiver);
    }

}
