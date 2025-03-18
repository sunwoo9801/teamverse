import React, { useState, useEffect } from "react";
import axios from "axios";
import defaultProfileImage from "../assets/images/basicprofile.jpg"; // 기본 프로필 이미지
import { getAccessToken } from "../utils/authUtils";
import { FaEllipsisV, FaEdit, FaTrashAlt } from "react-icons/fa";
import "../styles/CommentList.css";

const CommentList = ({ projectId,activityId, taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null); // 현재 수정 중인 댓글 ID
  const [editContent, setEditContent] = useState(""); // 수정할 내용
  const [user, setUser] = useState(null); // 현재 로그인한 사용자
  const [menuOpen, setMenuOpen] = useState(null); // 점 3개 버튼 상태


  const handleTextareaInput = (e) => {
    const maxHeight = 200; // 최대 높이 (px)
    if (!e.target.value) {
      // 내용이 없으면 초기 높이 32px로 설정
      e.target.style.height = "32px";
      e.target.style.overflowY = "hidden";
    } else {
      e.target.style.height = "auto";
      const newHeight = e.target.scrollHeight;
      if (newHeight > maxHeight) {
        e.target.style.height = maxHeight + "px";
        e.target.style.overflowY = "auto";
      } else {
        e.target.style.height = newHeight + "px";
        e.target.style.overflowY = "hidden";
      }
    }
  };

  // 사용자 정보를 한 번만 가져오기
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 댓글 목록 가져오기 (activityId 또는 taskId가 있을 때)
  useEffect(() => {
    if (activityId || taskId) {
      fetchComments();
    }
  }, [activityId, taskId]);

  // 댓글 목록 fetch 함수
  const fetchComments = async () => {
    console.log("📢 댓글 불러오기 시작");
    const token = getAccessToken();
    if (!token) return;
    if (!activityId && !taskId) return;

    const url = activityId
      ? `https://teamverse.onrender.com/api/projects/${projectId}/comments/activity/${activityId}`
      : `https://teamverse.onrender.com/api/projects/${projectId}/comments/task/${taskId}`;

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log("댓글 목록:", response.data);
      const updatedComments = response.data.map((comment) => ({
        ...comment,
        user: {
          ...comment.user,
          profileImage:
            comment.user?.profileImage && comment.user.profileImage.trim() !== ""
              ? comment.user.profileImage
              : defaultProfileImage,
        },
      }));
      setComments(updatedComments);
    } catch (error) {
      console.error("❌ 댓글 불러오기 실패:", error);
    }
  };

  // 현재 로그인한 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const response = await axios.get("https://teamverse.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log("✅ 사용자 정보 로드 완료:", response.data);
      setUser(response.data);
    } catch (error) {
      console.error("❌ 사용자 정보 불러오기 실패:", error);
    }
  };

  // 댓글 입력 핸들러
  const handleInputChange = (e) => {
    setNewComment(e.target.value);
  };

  // 댓글 추가 핸들러
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    const token = getAccessToken();

    const payload = activityId
      ? { userId: user.id, content: newComment }
      : { taskId: taskId, userId: user.id, content: newComment };

    const url = activityId
      ? `https://teamverse.onrender.com/api/projects/${projectId}/comments/activity/${activityId}`
      : `https://teamverse.onrender.com/api/projects/${projectId}/comments/task/${taskId}`;

    try {
      await axios.post(
        url,
        payload,
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log("댓글 추가 성공!");
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("❌ 댓글 추가 실패:", error);
    }
  };

  // 댓글 수정 핸들러
  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;
    const token = getAccessToken();
    try {
      await axios.put(
        `https://teamverse.onrender.com/api/projects/${projectId}/comments/${commentId}`,
        { userId: user.id, content: editContent },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setEditingCommentId(null);
      fetchComments();
    } catch (error) {
      console.error("❌ 댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = async (commentId) => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!window.confirm("정말로 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`https://teamverse.onrender.com/api/projects/${projectId}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: user.id },
        withCredentials: true,
      });
      setComments((prevComments) => prevComments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error("❌ 댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };
  return (
    <div className="comment-section">
      <h4>댓글 {comments.length}개</h4>
      {/* <div className="comment-input">
        <input
          type="text"
          placeholder="댓글을 입력하세요..."
          value={newComment}
          onChange={handleInputChange}
        />
        <button onClick={handleAddComment}>등록</button>
      </div> */}
      <div className="comment-input">
        <textarea
          placeholder="댓글을 입력하세요..."
          value={newComment}
          onChange={handleInputChange}
          onInput={handleTextareaInput}
          className="comment-input-textarea"
        ></textarea>
        <button onClick={handleAddComment}>등록</button>
      </div>


      <ul className="comment-list">
        {comments.map((comment) => (
          <li key={comment.id} className="comment-item">
            <div className="comment-content">
              <div className="comment-header-row">
                <img
                  src={comment.profileImage || defaultProfileImage}
                  alt="프로필"
                  className="comment-profile"
                  onError={(e) => (e.target.src = defaultProfileImage)}
                />
                <div className="comment-text-info">
                  <p className="comment-author">{comment.username || "익명"}</p>
                  <p className="comment-date">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "날짜 없음"}
                  </p>
                </div>
              </div>

              {editingCommentId === comment.id ? (
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="comment-edit-input"
                />
              ) : (
                <p className="comment-text">{comment.content}</p>
              )}

            </div>
            {/* 본인 댓글에만 메뉴 버튼 표시 */}
            {user?.id === comment.userId && (
              <div className="comment-menu">
                <FaEllipsisV
                  className="menu-icon"
                  onClick={() => setMenuOpen(menuOpen === comment.id ? null : comment.id)}
                />
                {menuOpen === comment.id && (
                  <div className="dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditContent(comment.content);
                        setMenuOpen(null);
                      }}
                    >
                      <FaEdit className="icon" /> 수정
                    </button>
                    <button className="dropdown-item" onClick={() => handleDeleteComment(comment.id)}>
                      <FaTrashAlt className="icon" /> 삭제
                    </button>
                  </div>
                )}
              </div>
            )}
            {editingCommentId === comment.id && (
              <div className="comment-edit-buttons">
                <button onClick={() => handleEditComment(comment.id)}>✔ 저장</button>
                <button onClick={() => setEditingCommentId(null)}>❌ 취소</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentList;
