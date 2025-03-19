import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ProfileModal.css";
import defaultProfileImage from "../assets/images/basicprofile.jpg"; // 기본 프로필 이미지 import
import EditProfileModal from "./EditProfileModal";
import { getAccessToken } from "../utils/authUtils";

const ProfileModal = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const token = getAccessToken();

      axios
        .get("https://teamverse.onrender.com/api/auth/me", {        
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        withCredentials: true,})
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => console.error("사용자 정보 가져오기 실패:", error));
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-content">
        <button className="profile-modal-close-btn" onClick={onClose}>✖</button>
        <div className="profile-modal-header">
          <img
            src={user.profileImage || defaultProfileImage}
            alt="Profile"
            className="profile-modal-image"
          />
          <h2 className="profile-modal-username">{user.username}</h2>
        </div>
        <div className="profile-modal-info">
          <div className="profile-modal-info-item"><strong>🏢 회사</strong> {user.companyName || "-"}</div>
          <div className="profile-modal-info-item"><strong>📧 이메일</strong> {user.email || "-"}</div>
          <div className="profile-modal-info-item"><strong>📱 휴대폰</strong> {user.phoneNumber || "-"}</div>
          <div className="profile-modal-info-item"><strong>📞 직책</strong> {user.position || "-"}</div>
          <div className="profile-modal-info-item"><strong>📂 부서</strong> {user.department || "-"}</div>
        </div>
        <div className="profile-modal-actions">
          <button className="profile-modal-chat-btn">💬 채팅</button>
          <button className="profile-modal-edit-btn" onClick={() => setShowEditModal(true)}>정보 수정</button>
        </div>
      </div>

      {/* 정보 수정 모달 */}
      <EditProfileModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onUpdate={setUser}
      />
    </div>
  );
};

export default ProfileModal;
