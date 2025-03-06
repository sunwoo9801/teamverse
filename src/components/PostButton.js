import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import PostTodoModal from "./PostTodoModal"; // ✅ 기존 모달
import "../styles/PostButton.css"; // ✅ 추가한 CSS 파일

const PostButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* ✅ 게시물 작성 버튼 */}
      <button className="post-button" onClick={() => setIsModalOpen(true)}>
        <FaPlus /> 게시물 작성
      </button>

      {/* ✅ 모달 열기 */}
      {isModalOpen && <PostTodoModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default PostButton;
