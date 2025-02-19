import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ProfileModal.css";
import defaultProfileImage from "../assets/images/basicprofile.jpg"; // 기본 프로필 이미지 import
import EditProfileModal from "./EditProfileModal";


const ProfileModal = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false); // ✅ 정보 수정 모달 상태 추가


  useEffect(() => {
    if (isOpen) {
      axios
        .get("http://localhost:8082/api/auth/me", { withCredentials: true })
        .then((response) => {
          console.log("✅ 사용자 정보:", response.data); // ✅ 콘솔에 데이터 출력
          setUser(response.data);
        })
        .catch((error) => console.error("사용자 정보 가져오기 실패:", error));
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>
        <div className="profile-header">
          <img
            src={user.profileImage || defaultProfileImage} // ✅ 기본 이미지 사용
            alt="Profile"
            className="profile-image"
          />
          <h2 className="profile-username">{user.username}</h2>
        </div>
        <div className="profile-info">
          <div className="info-item"><strong>🏢 회사</strong> {user.companyName || "-"}</div>
          <div className="info-item"><strong>📧 이메일</strong> {user.email || "-"}</div>
          <div className="info-item"><strong>📱 휴대폰</strong> {user.phoneNumber || "-"}</div>
          <div className="info-item"><strong>📞 직책</strong> {user.position || "-"}</div>
          <div className="info-item"><strong>📂 부서</strong> {user.department || "-"}</div>
        </div>
        <div className="profile-actions">
          <button className="chat-btn">💬 채팅</button>
          <button className="edit-btn" onClick={() => setShowEditModal(true)}>정보 수정</button>
        </div> 
      </div>

      {/* ✅ 정보 수정 모달 추가 */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onUpdate={setUser} // ✅ 정보 수정 후 UI 업데이트
      />
    </div>
  );
};

export default ProfileModal;
