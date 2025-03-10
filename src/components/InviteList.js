import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import "../styles/InviteList.css";
import { getStompClient } from "../api/websocket";


const InviteList = ({ refreshProjects }) => {
  const [invites, setInvites] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const userEmail = localStorage.getItem("email") || sessionStorage.getItem("email");


  // 로컬 스토리지에서 처리된 초대 목록 불러오기
  const getStoredAcceptedInvites = () => {
    const storedInvites = localStorage.getItem("acceptedInvites");
    return storedInvites ? JSON.parse(storedInvites) : [];
  };


  const getStoredRejectedInvites = () => {
    const storedInvites = localStorage.getItem("rejectedInvites");
    return storedInvites ? JSON.parse(storedInvites) : [];
  };


  // 초대 목록 가져오기
  const fetchInvites = async () => {
    const token = getAccessToken();
    try {
      const response = await axios.get("http://localhost:8082/api/team/invites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📌 받은 초대 목록:", response.data);

      // 이미 처리된 초대는 필터링
      const storedAcceptedInvites = getStoredAcceptedInvites();
      const filteredInvites = response.data.filter(invite => !storedAcceptedInvites.includes(invite.id));

      setInvites(filteredInvites);
      setShowPopup(filteredInvites.length > 0); // 초대가 있으면 팝업 표시
    } catch (error) {
      console.error("❌ 초대 목록 불러오기 실패:", error);
    }
  };



  useEffect(() => {
    fetchInvites();

    if (!userEmail) return;

    const stompClient = getStompClient();
    if (!stompClient.connected) {
      stompClient.activate(); // WebSocket 연결 활성화
    }

    // WebSocket이 완전히 연결된 후 구독 실행
    const onConnect = () => {
      console.log("WebSocket 연결 성공, 초대 알림 구독 시작");
      const subscription = stompClient.subscribe(`/topic/invites/${userEmail}`, (message) => {
        console.log("📩 실시간 초대 알림 수신:", message.body);
        fetchInvites(); // 초대 목록 다시 불러오기
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    // 이미 연결되었으면 바로 실행, 아니면 `onConnect` 설정
    if (stompClient.connected) {
      onConnect();
    } else {
      stompClient.onConnect = onConnect;
    }

    return () => {
      if (stompClient.connected) {
        stompClient.deactivate(); // WebSocket 연결 해제
      }
    };
  }, [userEmail]);



  // 초대 수락 처리
  const handleAcceptInvite = async (inviteId) => {
    const token = getAccessToken();
    try {
      await axios.post(`http://localhost:8082/api/team/invite/${inviteId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`초대(${inviteId}) 수락`);

      // 로컬 스토리지에 초대 ID 저장 (새로고침해도 유지)
      const storedAcceptedInvites = getStoredAcceptedInvites();
      localStorage.setItem("acceptedInvites", JSON.stringify([...storedAcceptedInvites, inviteId]));

      // UI에서 초대 제거
      setInvites((prevInvites) => {
        const updatedInvites = prevInvites.filter(invite => invite.id !== inviteId);
        if (updatedInvites.length === 0) setShowPopup(false); // 마지막 초대면 팝업 닫기
        return updatedInvites;
      });

      refreshProjects(); // 프로젝트 목록 갱신
    } catch (error) {
      console.error("❌ 초대 수락 실패:", error);
    }
  };

  // 초대 거절 처리
  const handleRejectInvite = async (inviteId) => {
    try {
      console.log(`❌ 초대(${inviteId}) 거절`);
          // 로컬 스토리지에 거절한 초대 ID 저장
    const storedRejectedInvites = getStoredRejectedInvites();
    localStorage.setItem("rejectedInvites", JSON.stringify([...storedRejectedInvites, inviteId]));



      // UI에서 초대 제거 (서버 요청 없이 즉시 반영)
      removeInviteFromUI(inviteId);

    } catch (error) {
      console.error("❌ 초대 거절 실패:", error);
    }
  };


  // UI에서 초대 제거 후 팝업 상태 갱신
  const removeInviteFromUI = (inviteId) => {
    setInvites((prevInvites) => {
      const updatedInvites = prevInvites.filter(invite => invite.id !== inviteId);
      if (updatedInvites.length === 0) setShowPopup(false); // 마지막 초대면 팝업 닫기
      return updatedInvites;
    });
  };



  return (
    <>
      {showPopup && (
        <>
          <div className="invite-popup-overlay" onClick={() => setShowPopup(false)} />
          <div className="invite-list-container">
            <button className="close-popup-btn" onClick={() => setShowPopup(false)}>❌</button>
            <h3>📩 초대받은 프로젝트</h3>
            {invites.length === 0 ? (
              <p>📭 현재 초대가 없습니다.</p>
            ) : (
              invites.map((invite) => (
                <div key={invite.id} className="invite-card">
                  <p>
                    <strong>{invite.sender.username}</strong> 님이 <strong>{invite.project.name}</strong> 프로젝트에 초대했습니다.
                  </p>
                  <div className="invite-buttons">
                    <button className="accept-btn" onClick={() => handleAcceptInvite(invite.id)}>수락</button>
                    <button className="reject-btn" onClick={() => handleRejectInvite(invite.id)}>❌ 거절</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </>
  );
};

export default InviteList;
