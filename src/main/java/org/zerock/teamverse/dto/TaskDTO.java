package org.zerock.teamverse.dto;

import java.time.LocalDate;
import java.util.List;
import org.zerock.teamverse.entity.Task;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskDTO {
	private Long id;
	private String name;
	private String status;
	private LocalDate startDate;
	private LocalDate dueDate;
	private String description;
	private Long projectId;
	private Long assignedTo; // 담당자 ID 추가
	private String assignedToUsername; // 담당자 이름 추가
	private Long createdBy; // 작성자 ID 추가
	private String createdByUsername; // 작성자 이름 추가
	private String color; // 작업 색상 필드
	private List<Long> fileIds; // 파일 ID 리스트 추가

	// 기본 생성자(필수)
	public TaskDTO() {
	}

	// 생성자
	public TaskDTO(Task task) {
		this.id = task.getId();
		this.name = task.getName();
		this.status = task.getStatus().toString();
		this.startDate = task.getStartDate();
		this.dueDate = task.getDueDate();
		this.description = task.getDescription();
		this.color = task.getColor();

		if (task.getProject() != null) {
			this.projectId = task.getProject().getId();
		}
		if (task.getAssignedTo() != null) {
			this.assignedTo = task.getAssignedTo().getId();
			this.assignedToUsername = task.getAssignedTo().getUsername(); // 담당자 이름 전달
		}
		if (task.getCreatedBy() != null) {
			this.createdBy = task.getCreatedBy().getId();
			this.createdByUsername = task.getCreatedBy().getUsername();
		}
	}
}