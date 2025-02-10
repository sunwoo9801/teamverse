import React, { useState, useEffect } from "react";
import axios from "axios";

const InviteList = () => {
    const [invitations, setInvitations] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            const response = await axios.get("http://localhost:8082/api/team/invitations", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setInvitations(response.data);
        } catch (error) {
            console.error("❌ 초대 목록 불러오기 실패:", error);
        }
    };

    const acceptInvite = async (inviteId) => {
        try {
            await axios.post(`http://localhost:8082/api/invites/${inviteId}/accept`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("✅ 초대를 수락했습니다!");
            fetchInvitations(); // 다시 초대 목록 불러오기
        } catch (error) {
            console.error("❌ 초대 수락 실패:", error);
        }
    };

    return (
        <div>
            <h2>초대 목록</h2>
            <ul>
                {invitations.map((invite) => (
                    <li key={invite.id}>
                        <p>{invite.senderEmail}님이 팀 초대를 보냈습니다.</p>
                        <button onClick={() => acceptInvite(invite.id)}>수락</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InviteList;
