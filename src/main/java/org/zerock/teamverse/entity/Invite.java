package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Invite {

    public enum InviteStatus {
        PENDING, ACCEPTED, REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;  // 초대를 보낸 사용자

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;  // 초대를 받은 사용자

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;  // 초대된 프로젝트

    @Enumerated(EnumType.STRING)
    private InviteStatus status;
}
