import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/TeamStatusPage.css";
import axios from "axios";

const TeamStatusPage = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleInvite = async () => {
      if (!inviteEmail.trim()) {
          alert("초대할 사용자의 이메일을 입력하세요.");
          return;
      }

      try {
          const token = localStorage.getItem("accessToken"); // 🔹 JWT 토큰 가져오기
          if (!token) {
              alert("로그인이 필요합니다.");
              return;
          }

          const response = await axios.post(
              "http://localhost:8082/api/team/invite",
              { email: inviteEmail },
              {
                  headers: {
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json"
                  }
              }
          );

          if (response.status === 200) {
              alert("초대 요청이 성공적으로 전송되었습니다!");
              setShowInviteModal(false);
              setInviteEmail(""); // 입력 필드 초기화
          } else {
              alert("초대할 수 없는 사용자입니다.");
          }
      } catch (error) {
          console.error("초대 요청 실패:", error);
          alert("초대 요청을 보낼 수 없습니다.");
      }
  };


  return (
    <div className="team-status">
        <h2>팀 상태</h2>
        <button className="invite-button" onClick={() => setShowInviteModal(true)}>
            팀원 초대
        </button>

        {showInviteModal && (
            <div className="modal">
                <div className="modal-content">
                    <h3>초대할 사용자 이메일 입력</h3>
                    <input
                        type="email"
                        placeholder="사용자 이메일"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <button onClick={handleInvite}>초대하기</button>
                    <button onClick={() => setShowInviteModal(false)}>취소</button>
                </div>
            </div>
        )}
    </div>
);
};

export default TeamStatusPage;
