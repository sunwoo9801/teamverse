import React from "react";
import "../styles/TaskDetailModal.css"; // ✅ 스타일 추가 예정

const TaskDetailModal = ({ task, onClose }) => {
  if (!task) return null; // ✅ task가 없으면 아무것도 표시하지 않음

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>업무 상세 정보</h2>

        <p><strong>업무 제목:</strong> {task.name}</p>
        <p><strong>담당자:</strong> {task.assignedTo ? `사용자 ${task.assignedTo}` : "미정"}</p>
        <p><strong>시작일:</strong> {task.startDate}</p>
        <p><strong>마감일:</strong> {task.dueDate}</p>
        <p><strong>상태:</strong> {task.status}</p>
        <p><strong>업무 내용:</strong> {task.description}</p>

        <div className="modal-actions">
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
