package org.zerock.teamverse.dto;

public class InviteRequestDTO {
    private String email;
    private Long projectId;

    // 기본 생성자
    public InviteRequestDTO() {}

    // Getter & Setter
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }
}
