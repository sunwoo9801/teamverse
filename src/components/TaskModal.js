import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/TaskModal.css";
import { getAccessToken } from "../utils/authUtils";

const TaskModal = ({ onClose, projectId, refreshTasks, editTask }) => {
  // ✅ 수정 모드인지 여부 체크
  const isEditMode = !!editTask; // editTask가 존재하면 수정 모드

  // ✅ 초기값 설정 (수정 모드면 기존 값 사용)
  const [taskData, setTaskData] = useState({
    name: editTask ? editTask.name : "",
    assignedTo: editTask ? editTask.assignedTo : "",
    startDate: editTask ? editTask.startDate : "",
    dueDate: editTask ? editTask.dueDate : "",
    description: editTask ? editTask.description : "",
    status: editTask ? editTask.status : "TODO",
    color: editTask ? editTask.color : "#ff99a5", // ✅ 색상 필드 추가

  });

  // ✅ Task 수정 시 기존 데이터를 불러와서 상태 업데이트
  useEffect(() => {
    if (editTask) {
      setTaskData({
        name: editTask.name,
        assignedTo: editTask.assignedTo,
        startDate: editTask.startDate,
        dueDate: editTask.dueDate,
        description: editTask.description,
        status: editTask.status,
        color: editTask.color || "#ff99a5", // ✅ 기존에 색상이 없으면 기본값 사용
      });
    }
  }, [editTask]);

  // ✅ 입력값이 변경될 때 상태 업데이트
  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  // ✅ 색상 변경 핸들러
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    console.log("🎨 선택한 색상:", newColor); // ✅ 콘솔에서 선택된 색상 확인
    setTaskData({ ...taskData, color: newColor }); // ✅ taskData에 color 저장
    
  };


    
  // ✅ Task 저장 (수정 또는 생성)
  const handleSubmit = async () => {
    console.log("🚀 저장 요청 데이터:", taskData); // 저장할 데이터 확인
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      
      if (isEditMode) {
        
        // ✅ 수정 API 호출
        await axios.put(`http://localhost:8082/api/user/tasks/${editTask.id}`, 
          { ...taskData, color: taskData.color, projectId }, // ✅ color 포함
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        alert("업무가 성공적으로 수정되었습니다!");
      } else {
        // ✅ 생성 API 호출
        await axios.post("http://localhost:8082/api/user/tasks", 
          { ...taskData, color: taskData.color, projectId }, // ✅ color 포함
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        alert("업무가 성공적으로 등록되었습니다!");
      }

      refreshTasks(); // ✅ Task 목록 갱신
      onClose(); // ✅ 모달 닫기
    } catch (error) {
      console.error("❌ Task 저장 실패:", error);
      alert("업무 저장에 실패했습니다.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isEditMode ? "업무 수정" : "업무 추가"}</h2>

        {/* ✅ 업무 제목 입력 */}
        <label>업무 제목:</label>
        <input type="text" name="name" value={taskData.name} onChange={handleChange} placeholder="업무 제목 입력" />

        {/* ✅ 담당자 선택 */}
        <label>담당자:</label>
        <select name="assignedTo" value={taskData.assignedTo} onChange={handleChange}>
          <option value="">담당자 선택</option>
          <option value="1">사용자 1</option>
          <option value="2">사용자 2</option>
        </select>

        {/* ✅ 작업 시작일 선택 */}
        <label>작업 시작일:</label>
        <input type="date" name="startDate" value={taskData.startDate} onChange={handleChange} />

        {/* ✅ 작업 마감일 선택 */}
        <label>작업 마감일:</label>
        <input type="date" name="dueDate" value={taskData.dueDate} onChange={handleChange} />

        {/* ✅ 업무 상태 선택 */}
        <label>업무 상태:</label>
        <select name="status" value={taskData.status} onChange={handleChange}>
          <option value="TODO">할 일</option>
          <option value="IN_PROGRESS">진행 중</option>
          <option value="DONE">완료</option>
        </select>

        {/* ✅ 작업 내용 입력 */}
        <label>작업 내용:</label>
        <textarea name="description" value={taskData.description} onChange={handleChange} placeholder="업무 내용을 입력하세요." />
        
        {/* ✅ 색상 선택 기능 */}
        <label>색상 선택</label>
        <input type="color" name="color" value={taskData.color} onChange={handleColorChange} />

        {/* ✅ 버튼 영역 */}
        <div className="modal-actions">
          <button onClick={onClose}>취소</button>
          <button onClick={handleSubmit} disabled={!taskData.name || !taskData.assignedTo || !taskData.startDate || !taskData.dueDate || !taskData.description || !taskData.status}>
            {isEditMode ? "수정" : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
