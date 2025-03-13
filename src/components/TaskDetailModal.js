import React from "react";
import parse from "html-react-parser";
import "../styles/TaskDetailModal.css";

const TaskDetailModal = ({ task, onClose }) => {
  if (!task) return null;

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString("ko-KR") : "미정";
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>업무 상세 정보</h2>
        <p><strong>업무 제목:</strong> {task.name}</p>
        <p>
          <strong>담당자:</strong>{" "}
          {task.assignedToUsername
            ? task.assignedToUsername
            : task.assignedTo && task.assignedTo.username
              ? task.assignedTo.username
              : "미정"}
        </p>
        <p><strong>시작일:</strong> {formatDate(task.startDate)}</p>
        <p><strong>마감일:</strong> {formatDate(task.dueDate)}</p>
        <p><strong>상태:</strong> {task.status}</p>
        <div>
          <strong>업무 내용:</strong>
          <div>{parse(task.description || "내용 없음")}</div>
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;