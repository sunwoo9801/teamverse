package org.zerock.teamverse.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.teamverse.entity.Invite;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.TeamMember;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.InviteRepository;
import org.zerock.teamverse.repository.ProjectRepository;
import org.zerock.teamverse.repository.TeamMemberRepository;
import org.zerock.teamverse.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class InviteService {

    private final InviteRepository inviteRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TeamMemberRepository teamMemberRepository;

    public InviteService(InviteRepository inviteRepository,
            UserRepository userRepository,
            ProjectRepository projectRepository,
            TeamMemberRepository teamMemberRepository) {
        this.inviteRepository = inviteRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.teamMemberRepository = teamMemberRepository;
    }

    // 초대 생성
    public Invite createInvite(String senderEmail, String receiverEmail, Long projectId) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Invite invite = new Invite();
        invite.setSender(sender);
        invite.setReceiver(receiver);
        invite.setProject(project);
        invite.setStatus(Invite.InviteStatus.PENDING);

        return inviteRepository.save(invite);
    }

    // 사용자의 초대 목록 조회
    public List<Invite> getUserInvites(User user) {
        return inviteRepository.findByReceiver(user);
    }

     // ✅ 초대 수락 및 프로젝트 멤버 추가
    @Transactional
    public void acceptInvite(Long inviteId) {
        Invite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("Invite not found"));
        
        invite.setStatus(Invite.InviteStatus.ACCEPTED);
        inviteRepository.save(invite);
    
        // ✅ 프로젝트 멤버 추가 (TeamMember 엔티티 활용)
        Project project = invite.getProject();
        User receiver = invite.getReceiver();

        TeamMember teamMember = new TeamMember();
        teamMember.setProject(project);
        teamMember.setUser(receiver);
        teamMember.setRole(TeamMember.Role.MEMBER); // 기본 역할 지정

        teamMemberRepository.save(teamMember);
    }
}
