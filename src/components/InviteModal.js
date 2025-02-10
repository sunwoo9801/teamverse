import React, { useState } from "react";
import axios from "axios";

const InviteModal = ({ projectId, onClose }) => {
  const [email, setEmail] = useState("");

  const handleInvite = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:8082/api/team/invite", 
        { receiverEmail: email, projectId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("초대가 전송되었습니다.");
      onClose();
    } catch (error) {
      console.error("초대 실패:", error);
      alert("초대 전송에 실패했습니다.");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>사용자 초대</h2>
        <input 
          type="email" 
          placeholder="사용자 이메일" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <button onClick={handleInvite}>초대</button>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default InviteModal;
