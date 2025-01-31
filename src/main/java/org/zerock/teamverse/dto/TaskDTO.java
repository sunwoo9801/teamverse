package org.zerock.teamverse.dto;

import java.time.LocalDate;

import org.zerock.teamverse.entity.Task;

public class TaskDTO {
	private Long id;
	private String name;
	private String status;
	private LocalDate dueDate;
	private Long projectId;

	//기본 생성자(필수)
	public TaskDTO() {}
	
	// 생성자
	public TaskDTO(Task task) {
		this.id = task.getId();
		this.name = task.getName();
		this.status = task.getStatus().toString(); // Enum을 String으로 변환
		this.dueDate = task.getDueDate();
		if (task.getProject() != null) {
			this.projectId = task.getProject().getId();
		}
	}

	// Getter와 Setter
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public LocalDate getDueDate() {
		return dueDate;
	}

	public void setDueDate(LocalDate dueDate) {
		this.dueDate = dueDate;
	}

	public Long getProjectId() {
		return projectId;
	}

	public void setProjectId(Long projectId) {
		this.projectId = projectId;
	}
}
