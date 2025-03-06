package org.zerock.teamverse.dto;

import java.time.LocalDateTime;

public class ChatMessageDTO {
    private Long id;
    private String content;
    private String senderEmail;
    private Long projectId;

    public ChatMessageDTO() {}

    public ChatMessageDTO(Long id, String content, String senderEmail, Long projectId) {
        this.id = id;
        this.content = content;
        this.senderEmail = senderEmail;
        this.projectId = projectId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }
}