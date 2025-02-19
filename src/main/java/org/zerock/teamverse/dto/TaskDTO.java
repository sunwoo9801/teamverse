package org.zerock.teamverse.dto;

import java.time.LocalDate;

import org.zerock.teamverse.entity.Task;

public class TaskDTO {
	private Long id;
	private String name;
	private String status;
	private LocalDate startDate; 
	private LocalDate dueDate;
	private String description;
	private Long projectId;
	private Long assignedTo; // ✅ 담당자 ID 추가
    private String color; // ✅ 추가: 작업 색상 필드


	//기본 생성자(필수)
	public TaskDTO() {}
	
	// 생성자
	public TaskDTO(Task task) {
		this.id = task.getId();
		this.name = task.getName();
		this.status = task.getStatus().toString(); // Enum을 String으로 변환
		this.startDate = task.getStartDate(); 
		this.dueDate = task.getDueDate();
		this.description = task.getDescription(); 
        this.color = task.getColor(); // ✅ 추가: 엔티티에서 color 값 가져오기


		if (task.getProject() != null) {
			this.projectId = task.getProject().getId();
		}
		if (task.getAssignedTo() != null) { // ✅ 담당자가 있을 경우
			this.assignedTo = task.getAssignedTo().getId();
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

	public LocalDate getStartDate() { 
		return startDate;
	}

	public void setStartDate(LocalDate startDate) { 
		this.startDate = startDate;
	}

	public LocalDate getDueDate() {
		return dueDate;
	}

	public void setDueDate(LocalDate dueDate) {
		this.dueDate = dueDate;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Long getProjectId() {
		return projectId;
	}

	public void setProjectId(Long projectId) {
		this.projectId = projectId;
	}
	
	public Long getAssignedTo() {
		return assignedTo;
	}

	public void setAssignedTo(Long assignedTo) {
		this.assignedTo = assignedTo;
	}

	public String getColor() { return color; } // ✅ 추가: Getter
    public void setColor(String color) { this.color = color; } // ✅ 추가: Setter
	

}
