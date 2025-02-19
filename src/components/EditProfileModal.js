import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/EditProfileModal.css";
import defaultProfileImage from "../assets/images/basicprofile.jpg";
import { getAccessToken, refreshAccessToken } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    companyName: "",
    department: "",
    position: "",
    phoneNumber: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        companyName: user.companyName || "",
        department: user.department || "",
        position: user.position || "",
        phoneNumber: user.phoneNumber || ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //   const handleSave = async (retry = false) => {
  //     try {
  //       let token = getAccessToken();

  //       if (!token) {
  //         alert("❌ 인증 토큰이 없습니다. 다시 로그인해주세요.");
  //         navigate("/login");
  //         return;
  //       }

  //       let requestData = { ...formData };

  //       const response = await axios.put("http://localhost:8082/api/auth/api/user", formData, {
  //         headers: { Authorization: `Bearer ${token}` },
  //         withCredentials: true
  //       });

  //       alert("✅ 정보가 성공적으로 수정되었습니다!");
  //       onUpdate(formData);
  //       onClose();
  //     } catch (error) {
  //       console.error("❌ 사용자 정보 수정 실패:", error);
  //  // ✅ 백엔드 응답 데이터 확인
  //  console.log("🔍 서버 응답 데이터:", error.response?.data);

  //  if (error.response?.status === 400) {
  //      const errorMessage = error.response?.data?.message || error.response?.data;

  //      if (errorMessage === "Email already in use") {
  //          alert("❌ 중복된 이메일입니다. 다른 이메일을 사용해주세요."); // ✅ 중복된 이메일 메시지 표시
  //      } else {
  //          alert(`❌ 오류: ${errorMessage}`);
  //      }
  //  } else if (error.response?.status === 401 && !retry) {
  //      console.warn("🔄 토큰 갱신 시도 중...");
  //      const newAccessToken = await refreshAccessToken();
  //      if (newAccessToken) {
  //          console.log("✅ 새 토큰으로 다시 요청");
  //          handleSave(true); // ✅ 새 토큰으로 다시 요청
  //          return;
  //      } else {
  //          alert("❌ 세션이 만료되었습니다. 다시 로그인해주세요.");
  //          navigate("/login");
  //      }
  //  } else {
  //      alert("❌ 정보 수정 중 오류가 발생했습니다.");
  //  }
  // }
  // };

  const handleSave = async (retry = false) => {
    try {
      let token = getAccessToken();

      if (!token) {
        alert("❌ 인증 토큰이 없습니다. 다시 로그인해주세요.");
        navigate("/login");
        return;
      }

      let requestData = { ...formData };

      // ✅ 이메일이 변경되지 않았다면, 이메일 필드를 요청 데이터에서 제거
      if (formData.email === user.email) {
        console.log("✅ 이메일 변경 없음 → 이메일 필드 제외하고 전송");
        delete requestData.email; // 이메일 필드 삭제
      }

      const response = await axios.put("http://localhost:8082/api/auth/api/user", requestData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      alert("✅ 정보가 성공적으로 수정되었습니다!");
      onUpdate(formData);
      onClose();
    } catch (error) {
      console.error("❌ 사용자 정보 수정 실패:", error);
      console.log("🔍 서버 응답 데이터:", error.response?.data);

      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data;

        if (errorMessage === "Email already in use") {
          alert("❌ 중복된 이메일입니다. 다른 이메일을 사용해주세요.");
        } else {
          alert(`❌ 오류: ${errorMessage}`);
        }
      } else if (error.response?.status === 401 && !retry) {
        console.warn("🔄 토큰 갱신 시도 중...");
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          console.log("✅ 새 토큰으로 다시 요청");
          handleSave(true);
          return;
        } else {
          alert("❌ 세션이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/login");
        }
      } else {
        alert("❌ 정보 수정 중 오류가 발생했습니다.");
      }
    }
  };



  if (!isOpen) return null;
  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>

        {/* ✅ 왼쪽 프로필 영역 */}
        <div className="edit-modal-sidebar">
          <img
            src={user.profileImage || defaultProfileImage}
            alt="Profile" className="edit-profile-image" />
          <h3 className="edit-username">{user.username}</h3>
          <ul className="edit-sidebar-menu">
            <li>계정</li>
            <li>알림</li>
            <li>디스플레이 설정</li>
            <li>보안</li>
            <li>외부 서비스 연동</li>
            <li>언어</li>
            <li>AI 설정</li>
          </ul>
        </div>

        {/* ✅ 오른쪽 정보 수정 영역 */}
        <div className="edit-modal-main">
          <h2 className="edit-modal-title">환경설정</h2>

          <div className="edit-form-group">
            <label>이름</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} />
          </div>
          <div className="edit-form-group">
            <label>이메일</label> {/* ✅ 이메일 필드 추가 */}
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="edit-form-group">
            <label>회사명</label>
            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} />
          </div>
          <div className="edit-form-group">
            <label>부서</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} />
          </div>
          <div className="edit-form-group">
            <label>직책</label>
            <input type="text" name="position" value={formData.position} onChange={handleChange} />
          </div>
          <div className="edit-form-group">
            <label>휴대폰 번호</label>
            <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
          </div>

          <button className="edit-save-btn" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;