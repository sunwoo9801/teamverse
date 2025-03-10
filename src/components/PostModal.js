import React, { useState } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import "../styles/PostTodoModal.css";
import ModalNav from "./ModalNav"; // 네비게이션 추가

const PostTodoModal = ({ onClose, refreshFeed }) => {
  const [activeTab, setActiveTab] = useState("post");
  const [postContent, setPostContent] = useState(""); // 글 작성 데이터 추가


  const handlePostSubmit = async () => {
    if (!postContent.trim()) {
      alert("⚠️ 내용을 입력하세요.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8082/api/activity/post`,
        {
          title: title, // 🔵 제목을 JSON으로 포함
          content: postContent,
          projectId: projectId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      alert("글이 등록되었습니다.");
      refreshFeed((prev) => [response.data, ...prev]); 
      onClose();
    } catch (error) {
      console.error("❌ 글 등록 실패:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <ModalNav activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* 글 작성 UI */}
          {activeTab === "post" && (
            <>
              <h2>글 작성</h2>
              <textarea
                placeholder="게시글 내용을 입력하세요."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
              <div className="modal-actions">
                <button onClick={onClose}>취소</button>
                <button onClick={handlePostSubmit}>등록</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostTodoModal;
