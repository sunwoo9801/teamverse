import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/TaskModal.css";
import { getAccessToken } from "../utils/authUtils";
import { FaMapMarkerAlt, FaTimes, FaPaperclip } from "react-icons/fa";
import { searchPlaces } from "../api/places"; // ✅ 백엔드 API 호출
import ReactMarkdown from "react-markdown"; // ✅ Markdown 지원 라이브러리 추가
import remarkGfm from "remark-gfm"; // ✅ 테이블, 링크 지원 추가
import FileUpload from "./FileUpload";



const TaskModal = ({ onClose, projectId, refreshTasks, editTask }) => {
  const isEditMode = !!editTask;
  const [taskData, setTaskData] = useState({
    name: editTask ? editTask.name : "",
    assignedTo: editTask ? editTask.assignedTo : "",
    startDate: editTask ? editTask.startDate : "",
    dueDate: editTask ? editTask.dueDate : "",
    description: editTask ? editTask.description : "",
    status: editTask ? editTask.status : "TODO",
    locations: editTask ? editTask.locations || [] : [], // ✅ 장소 목록 추가
    color: editTask ? editTask.color || "#ff99a5" : "#ff99a5",
  });

  const [showPlaceSearch, setShowPlaceSearch] = useState(false);
  const [places, setPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCache, setSearchCache] = useState({});
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(""); // ✅ API 키 상태 추가
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false); // 📌 파일 업로드 창 상태 추가
  const contentRef = useRef(null); // ✅ contentEditable div 추가
  const isModal = true; // ✅ PostTodoModal과 동일하게 모달 여부 체크
  const [teamMembers, setTeamMembers] = useState([]); // 팀원 목록 상태


  useEffect(() => {
    if (editTask) {
      setTaskData({
        name: editTask.name,
        assignedTo: editTask.assignedTo,
        startDate: editTask.startDate,
        dueDate: editTask.dueDate,
        description: editTask.description,
        descriptionElements: [<div dangerouslySetInnerHTML={{ __html: editTask.description }} />],
        status: editTask.status,
        locations: editTask.locations || [],
        color: editTask.color || "#ff99a5", // ✅ 기존에 색상이 없으면 기본값 사용
      });
      // ✅ 기존에 업로드된 파일이 있다면 추가
      if (editTask.files) {
        setUploadedFiles(editTask.files);
      }
    }

    const fetchGoogleMapsApiKey = async () => {
      const token = getAccessToken(); // 🔥 JWT 토큰 가져오기
      try {
        const response = await axios.get("http://localhost:8082/api/places/google-maps-key", {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ 인증 헤더 추가
          },
          withCredentials: true,
        });
        setGoogleMapsApiKey(response.data);
      } catch (error) {
        console.error("❌ Google Maps API 키 가져오기 실패:", error);
      }
    };

    fetchGoogleMapsApiKey();
  }, [editTask]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const token = getAccessToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8082/api/user/projects/${projectId}/team-members`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        setTeamMembers(response.data); // ✅ API 응답 데이터를 teamMembers 상태에 저장
      } catch (error) {
        console.error("❌ 팀원 목록 불러오기 실패:", error);
      }
    };

    fetchTeamMembers();
  }, [projectId]); // ✅ projectId가 변경될 때마다 실행


  // ✅ 입력값 변경 핸들러 (모든 입력 필드)
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 입력 변경됨 - ${name}: ${value}`); // ✅ 콘솔 로그 추가
    setTaskData((prev) => ({
      ...prev,
      [name]: value, // ✅ 입력된 필드(name)에 맞게 데이터 업데이트
    }));
  };


  // ✅ 색상 변경 핸들러
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    console.log("🎨 선택한 색상:", newColor); // ✅ 콘솔에서 선택된 색상 확인
    setTaskData({ ...taskData, color: newColor }); // ✅ taskData에 color 저장

  };


  // ✅ 입력 내용 변경 핸들러 (텍스트)
  const handleTextChange = (e) => {
    setTaskData((prev) => ({
      ...prev,
      description: e.target.value, // ✅ 텍스트 입력 가능하도록 수정
    }));
  };

  // ✅ 장소 추가 (HTML 형식으로 작업 내용에 삽입)
  const addPlaceToTask = (place) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
      place.name
    )}&zoom=15&size=600x300&maptype=roadmap&markers=color:red|${encodeURIComponent(place.name)}&key=${googleMapsApiKey}`;

    const placeAddress = place.formatted_address || place.vicinity || "주소 정보 없음";

    const newLocation = {
      name: place.name,
      address: placeAddress,
      mapImageUrl: staticMapUrl,
      googleMapsUrl,
    };

    // ✅ HTML 형식으로 작업 내용에 장소 추가
    setTaskData((prev) => ({
      ...prev,
      description: prev.description + `\n\n📍 ${place.name} (${placeAddress})`,
      locations: [...prev.locations, newLocation],
    }));

    setShowPlaceSearch(false);
  };

  // ✅ 장소 삭제
  const removePlace = (placeName) => {
    setTaskData((prev) => ({
      ...prev,
      description: prev.description
        .split("\n")
        .filter((line) => !line.includes(placeName))
        .join("\n"),
      locations: prev.locations.filter((place) => place.name !== placeName),
    }));
  };

  // ✅ 검색어 입력 시 자동으로 장소 검색 실행 (캐싱 적용)
  useEffect(() => {
    if (searchQuery.trim()) {
      if (searchCache[searchQuery]) {
        setPlaces(searchCache[searchQuery]);
      } else {
        const delayDebounceFn = setTimeout(async () => {
          try {
            console.log(`🔍 자동 검색 실행: ${searchQuery}`);
            const results = await searchPlaces(searchQuery);
            setPlaces(results);
            setSearchCache((prevCache) => ({
              ...prevCache,
              [searchQuery]: results, // ✅ 캐시에 저장
            }));
          } catch (error) {
            console.error("❌ 장소 검색 실패:", error);
          }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
      }
    } else {
      setPlaces([]);
    }
  }, [searchQuery, searchCache]);

  // ✅ 파일 업로드 시 `contentEditable div`에 직접 추가
  const handleFileUploaded = (fileUrl) => {
    console.log("📌 업로드된 파일 URL:", fileUrl);

    const isImage = /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(fileUrl);
    const fileName = fileUrl.split("/").pop();

    setUploadedFiles((prevFiles) => [...prevFiles, fileUrl]);

    if (contentRef.current) {
      const newNode = document.createElement("div");
      newNode.className = "file-container";

      if (isImage) {
        newNode.innerHTML = `
      <img src="http://localhost:8082${fileUrl}" alt="업로드된 이미지" class="uploaded-image" />
      ${isModal ? `<button class="delete-file-btn">🗑️</button>` : ""}
    `;
      } else {
        newNode.innerHTML = `
      <div class="file-preview">
        <a href="http://localhost:8082${fileUrl}" target="_blank" class="file-name">${fileName}</a>
        ${isModal ? `<button class="delete-file-btn">🗑️</button>` : ""}
      </div>
    `;
      }

      if (isModal) {
        newNode.querySelector(".delete-file-btn").addEventListener("click", () => {
          removeFile(fileUrl, newNode);
        });
      }

      contentRef.current.appendChild(newNode);
    }
  };

  const removeFile = (fileUrl, fileElement) => {
    console.log("📌 삭제할 파일:", fileUrl);
    setUploadedFiles((prevFiles) => prevFiles.filter((file) => file !== fileUrl));
    if (fileElement) {
      fileElement.remove();
    }
  };

  // const handleSubmit = async () => {
  //   const token = getAccessToken();
  //   if (!token) {
  //     alert("로그인이 필요합니다.");
  //     return;
  //   }


  //   // ✅ contentEditable div의 내용을 가져와서 description에 반영
  //   const content = contentRef.current.innerHTML.trim();
  //   setTaskData((prev) => ({ ...prev, description: content }));

  //   try {
  //     if (isEditMode) {
  //       await axios.put(
  //         `http://localhost:8082/api/user/tasks/${editTask.id}`,
  //         { ...taskData, projectId, files: uploadedFiles },
  //         {
  //           headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  //           withCredentials: true,
  //         }
  //       );
  //       alert("업무가 성공적으로 수정되었습니다!");
  //     } else {
  //       await axios.post(
  //         "http://localhost:8082/api/user/tasks",
  //         { ...taskData, projectId, files: uploadedFiles },
  //         {
  //           headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  //           withCredentials: true,
  //         }
  //       );
  //       alert("업무가 성공적으로 등록되었습니다!");
  //     }
  //     refreshTasks();
  //     onClose();
  //   } catch (error) {
  //     console.error("❌ Task 저장 실패:", error);
  //     alert("업무 저장에 실패했습니다.");
  //   }
  // };

  const handleSubmit = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    // ✅ contentEditable div에서 값을 가져와 즉시 taskData에 반영
    const updatedTaskData = {
      ...taskData,
      description: contentRef.current.innerHTML.trim() || "", // ✅ null 방지
      assignedTo: taskData.assignedTo || "", // ✅ 담당자 정보 포함 (null 방지)  
    };

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:8082/api/user/tasks/${editTask.id}`,
          { ...updatedTaskData, projectId, files: uploadedFiles },
          {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        alert("업무가 성공적으로 수정되었습니다!");
      } else {
        await axios.post(
          "http://localhost:8082/api/user/tasks",
          { ...updatedTaskData, projectId, files: uploadedFiles },
          {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        alert("업무가 성공적으로 등록되었습니다!");
      }
      refreshTasks();
      onClose();
    } catch (error) {
      console.error("❌ Task 저장 실패:", error);
      alert("업무 저장에 실패했습니다.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h2>{isEditMode ? "업무 수정" : "업무 추가"}</h2>

          <label>업무 제목:</label>
          <input
            type="text"
            name="name"
            value={taskData.name}
            onChange={handleChange}
            placeholder="업무 제목 입력"
          />

          {/* <label>담당자:</label>
          <select name="assignedTo" value={taskData.assignedTo} onChange={handleChange}>
            <option value="">담당자 선택</option>
            <option value="1">사용자 1</option>
            <option value="2">사용자 2</option>
          </select> */}

          <label>담당자:</label>
          <select name="assignedTo" value={taskData.assignedTo} onChange={handleChange}>
            <option value="">담당자 선택</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.username} {/* ✅ 팀원 이름 표시 */}
              </option>
            ))}
          </select>


          <label>작업 시작일:</label>
          <input type="date" name="startDate" value={taskData.startDate} onChange={handleChange} />

          <label>작업 마감일:</label>
          <input type="date" name="dueDate" value={taskData.dueDate} onChange={handleChange} />

          <label>업무 상태:</label>
          <select name="status" value={taskData.status} onChange={handleChange}>
            <option value="TODO">할 일</option>
            <option value="IN_PROGRESS">진행 중</option>
            <option value="DONE">완료</option>
          </select>

          <label>작업 내용:</label>
          {/* ✅ contentEditable div 사용 */}
          <div
            ref={contentRef}
            contentEditable
            className="editable-content"
            placeholder="업무 내용을 입력하세요."
          ></div>


          {/* ✅ 추가된 장소 리스트 */}
          {taskData.locations.length > 0 && (
            <div className="locations-container">
              {taskData.locations.map((place, index) => (
                <div key={index} className="place-card">
                  <img src={place.mapImageUrl} alt={place.name} className="place-map-thumbnail" />
                  <div className="place-info">
                    <a href={place.googleMapsUrl} target="_blank" className="place-name">
                      <strong>{place.name}</strong>
                    </a>
                    <p className="place-address">{place.address}</p>
                  </div>
                  <button className="delete-place-btn" onClick={() => removePlace(place.name)}>
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button className="icon-btn" onClick={() => setShowPlaceSearch(true)}>
            <FaMapMarkerAlt /> 장소 추가
          </button>
          {showPlaceSearch && (
            <div className="place-search-container">
              <input
                type="text"
                placeholder="장소 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="place-search-input"
              />

              {places.length > 0 && (
                <ul className="place-search-list">
                  {places.map((place) => (
                    <li key={place.place_id} onClick={() => addPlaceToTask(place)} className="place-search-item">
                      <div className="place-info">
                        <FaMapMarkerAlt className="place-icon" />
                        <span className="place-name">{place.name}</span>
                        <span className="place-address">{place.formatted_address}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ✅ 색상 선택 기능 */}
          <label>색상 선택</label>
          <input type="color" name="color" value={taskData.color} onChange={handleColorChange} />


          {/* 📌 하단 버튼 영역 */}
          <div className="modal-footer">
            <div className="modal-actions-left">
              {/* ✅ 파일 추가 버튼 */}
              <button className="icon-btn" onClick={() => setShowFileUpload(!showFileUpload)}>
                <FaPaperclip /> 파일 추가
              </button>
              {showFileUpload && <FileUpload projectId={projectId} onFileUploaded={handleFileUploaded} />}

              <button className="icon-btn">
                <FaMapMarkerAlt /> 장소 추가
              </button>
            </div>

            <div className="modal-actions-right">
              <button onClick={onClose}>취소</button>
              <button onClick={handleSubmit}>등록</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
