package org.zerock.teamverse.service;

import org.springframework.stereotype.Service;
import org.zerock.teamverse.entity.Invite;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.InviteRepository;
import org.zerock.teamverse.repository.ProjectRepository;
import org.zerock.teamverse.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class InviteService {
    
    private final InviteRepository inviteRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public InviteService(InviteRepository inviteRepository, UserRepository userRepository, ProjectRepository projectRepository) {
        this.inviteRepository = inviteRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    // 초대 생성
    public Invite createInvite(String senderEmail, String receiverEmail, Long projectId) {
        User sender = userRepository.findByEmail(senderEmail).orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findByEmail(receiverEmail).orElseThrow(() -> new RuntimeException("Receiver not found"));
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));

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

    // 초대 수락
    public void acceptInvite(Long inviteId) {
        Invite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("Invite not found"));
        
        invite.setStatus(Invite.InviteStatus.ACCEPTED);
        inviteRepository.save(invite);
    
        // ✅ 프로젝트 멤버 추가 (ManyToMany 적용된 관계 활용)
        Project project = invite.getProject();
        project.addMember(invite.getReceiver()); 
        projectRepository.save(project);
    }
    
}
