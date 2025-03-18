import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/TaskModal.css";
import { getAccessToken } from "../utils/authUtils";
import { FaMapMarkerAlt, FaTimes, FaPaperclip } from "react-icons/fa";
import { searchPlaces } from "../api/places"; // 백엔드 API 호출
import ReactMarkdown from "react-markdown"; // Markdown 지원 라이브러리 추가
import remarkGfm from "remark-gfm"; // 테이블, 링크 지원 추가
import FileUpload from "./FileUpload";

const TaskModal = ({ onClose, projectId, refreshTasks, editTask }) => {
  const isEditMode = !!editTask;
  const [taskData, setTaskData] = useState({
    name: editTask ? editTask.name : "",
    assignedTo: editTask
      ? (editTask.assignedTo && editTask.assignedTo.id
        ? editTask.assignedTo.id
        : editTask.assignedTo)
      : "", startDate: editTask ? editTask.startDate : "",
    dueDate: editTask ? editTask.dueDate : "",
    description: editTask ? editTask.description : "",
    status: editTask ? editTask.status : "TODO",
    locations: editTask ? editTask.locations || [] : [],
    color: editTask ? editTask.color || "#ff99a5" : "#ff99a5",
  });

  const [showPlaceSearch, setShowPlaceSearch] = useState(false);
  const [places, setPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCache, setSearchCache] = useState({});
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(""); // API 키 상태 추가
  const [uploadedFiles, setUploadedFiles] = useState(
    editTask && editTask.files
      ? editTask.files.map((file) => ({
        url: file.startsWith("http") ? file : `https://teamverse.onrender.com${file}`,
        isImage: /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(file),
        fileName: file.split("/").pop(),
      }))
      : []
  ); const [showFileUpload, setShowFileUpload] = useState(false); // 📌 파일 업로드 창 상태 추가
  const contentRef = useRef(null); // contentEditable div 추가
  const [teamMembers, setTeamMembers] = useState([]); // 팀원 목록 상태

  useEffect(() => {
    if (editTask) {
      setTaskData({
        name: editTask.name,
        assignedTo: editTask
          ? (editTask.assignedTo && editTask.assignedTo.id
            ? editTask.assignedTo.id
            : editTask.assignedTo)
          : "", h: editTask.startDate,
        dueDate: editTask.dueDate,
        description: editTask.description,
        status: editTask.status,
        locations: editTask.locations || [],
        color: editTask.color || "#ff99a5",
      });
      // contentEditable div에 기존 description 반영
      if (contentRef.current) {
        contentRef.current.innerHTML = editTask.description || "";
      }
      if (editTask.files) {
        setUploadedFiles(editTask.files.map(file => ({
          url: file.startsWith("http") ? file : `https://teamverse.onrender.com${file}`,
          isImage: /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(file),
          fileName: file.split("/").pop()
        })));
      }
    }

    const fetchGoogleMapsApiKey = async () => {
      const token = getAccessToken(); // 🔥 JWT 토큰 가져오기
      try {
        const response = await axios.get("https://teamverse.onrender.com/api/places/google-maps-key", {
          headers: {
            Authorization: `Bearer ${token}`, // 인증 헤더 추가
          },
          withCredentials: true,
        });
        setGoogleMapsApiKey(response.data);
      } catch (error) {
        console.error("❌ Google Maps API 키 가져오기 실패:", error);
      }
    };

    fetchGoogleMapsApiKey();
    fetchTeamMembers();
  }, [editTask]);

  // 팀원 목록 가져오기
  const fetchTeamMembers = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const response = await axios.get(`https://teamverse.onrender.com/api/user/projects/${projectId}/team-members`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setTeamMembers(response.data);
    } catch (error) {
      console.error("❌ 팀원 목록 불러오기 실패:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: name === "assignedTo" ? (value ? Number(value) : "") : value, // assignedTo를 Number로 변환
    }));
  };

  // 색상 변경 핸들러
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setTaskData({ ...taskData, color: newColor }); // taskData에 color 저장
  };
  // contentEditable 내용 변경 시 동기화
  const handleContentChange = () => {
    if (contentRef.current) {
      setTaskData((prev) => ({
        ...prev,
        description: contentRef.current.innerHTML,
      }));
    }
  };
  // 장소 추가
  const addPlaceToTask = (place) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(place.name)}&zoom=15&size=600x300&maptype=roadmap&markers=color:red|${encodeURIComponent(place.name)}&key=${googleMapsApiKey}`;
    const placeAddress = place.formatted_address || place.vicinity || "주소 정보 없음";

    const newLocation = { name: place.name, address: placeAddress, mapImageUrl: staticMapUrl, googleMapsUrl };
    setTaskData((prev) => ({
      ...prev,
      description: prev.description + `\n\n📍 ${place.name} (${placeAddress})`,
      locations: [...prev.locations, newLocation],
    }));
    if (contentRef.current) {
      contentRef.current.innerHTML += `<p>📍 <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer">${place.name}</a> (${placeAddress})</p>`;
    }
    setShowPlaceSearch(false);
  };

  // 장소 삭제
  const removePlace = (placeName) => {
    setTaskData((prev) => ({
      ...prev,
      description: prev.description.split("\n").filter((line) => !line.includes(placeName)).join("\n"),
      locations: prev.locations.filter((place) => place.name !== placeName),
    }));
  };

  // 장소 검색
  useEffect(() => {
    if (searchQuery.trim()) {
      if (searchCache[searchQuery]) {
        setPlaces(searchCache[searchQuery]);
      } else {
        const delayDebounceFn = setTimeout(async () => {
          try {
            const results = await searchPlaces(searchQuery);
            setPlaces(results);
            setSearchCache((prevCache) => ({ ...prevCache, [searchQuery]: results }));
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
  // 파일 업로드 처리
  const handleFileUploaded = (fileUrl) => {
    const isImage = /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(fileUrl);
    const fileName = fileUrl.split("/").pop();
    const absoluteUrl = fileUrl.startsWith("http") ? fileUrl : `https://teamverse.onrender.com${fileUrl}`;

    setUploadedFiles((prevFiles) => [...prevFiles, { url: absoluteUrl, isImage, fileName }]);

    if (contentRef.current) {
      const newNode = document.createElement("div");
      newNode.className = "file-container";
      newNode.contentEditable = "false";
      newNode.innerHTML = isImage
        ? `<img src="${absoluteUrl}" alt="업로드된 이미지" class="uploaded-image" /><button class="delete-file-btn">🗑️</button>`
        : `<div class="file-preview"><a href="${absoluteUrl}" target="_blank" class="file-name">${fileName}</a><button class="delete-file-btn">🗑️</button></div>`;
      newNode.querySelector(".delete-file-btn").addEventListener("click", () => removeFile(absoluteUrl, newNode));
      contentRef.current.appendChild(newNode);
      setTaskData((prev) => ({ ...prev, description: contentRef.current.innerHTML }));
    }
  };

  // 파일 삭제
  const removeFile = (fileUrl, fileElement) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.url !== fileUrl));
    if (fileElement) fileElement.remove();
    if (contentRef.current) {
      setTaskData((prev) => ({ ...prev, description: contentRef.current.innerHTML }));
    }
  };

  // 제출 처리
  // const handleSubmit = async () => {
  //   const token = getAccessToken();
  //   if (!token) {
  //     alert("로그인이 필요합니다.");
  //     return;
  //   }

  //   // 업무 제목이 없으면 등록하지 않음
  //   if (!taskData.name.trim()) {
  //     alert("업무 제목을 입력하세요.");
  //     return;
  //   }

  //   // startDate와 dueDate에 기본값(오늘 날짜)을 할당 (YYYY-MM-DD 형식)
  //   // const todayStr = new Date().toISOString().split("T")[0];

  //   const updatedTaskData = {
  //     ...taskData,
  //     description: contentRef.current ? contentRef.current.innerHTML.trim() : "",
  //     projectId,
  //     files: uploadedFiles.map((file) => file.url),
  //     // 기본값 적용: 사용자가 입력하지 않은 경우 오늘 날짜로 설정
  //     // startDate: taskData.startDate || todayStr,
  //     // dueDate: taskData.dueDate || todayStr,
  //     startDate: taskData.startDate ? taskData.startDate : null,
  //     dueDate: taskData.dueDate ? taskData.dueDate : null,
  //   };

  //   try {
  //     if (isEditMode) {
  //       await axios.put(
  //         `https://teamverse.onrender.com/api/user/tasks/${editTask.id}`,
  //         updatedTaskData,
  //         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, withCredentials: true }
  //       );
  //       alert("업무가 성공적으로 수정되었습니다!");
  //     } else {
  //       await axios.post(
  //         "https://teamverse.onrender.com/api/user/tasks",
  //         updatedTaskData,
  //         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, withCredentials: true }
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

    if (!taskData.name.trim()) {
      alert("업무 제목을 입력하세요.");
      return;
    }

    const updatedTaskData = {
      ...taskData,
      description: contentRef.current ? contentRef.current.innerHTML.trim() : "",
      projectId,
      files: uploadedFiles.map((file) => file.url),
      startDate: taskData.startDate || null,
      dueDate: taskData.dueDate || null,
    };

    try {
      if (isEditMode) {
        await axios.put(
          `https://teamverse.onrender.com/api/user/tasks/${editTask.id}`,
          updatedTaskData,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, withCredentials: true }
        );
        alert("업무가 성공적으로 수정되었습니다!");
      } else {
        await axios.post(
          "https://teamverse.onrender.com/api/user/tasks",
          updatedTaskData,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, withCredentials: true }
        );
        alert("업무가 성공적으로 등록되었습니다!");
      }

      refreshTasks(); // 🔥 업무 상태 변경 후 통계 반영
      onClose();
    } catch (error) {
      console.error("❌ Task 저장 실패:", error);
      alert("업무 저장에 실패했습니다.");
    }
  };

  return (
    <div className="task-modal-overlay">
      <div className="task-modal-container">
        <div className="task-modal-content">
          <h2>{isEditMode ? "업무 수정" : "업무 추가"}</h2>

          <label>업무 제목:</label>
          <input
            type="text"
            name="name"
            value={taskData.name}
            onChange={handleChange}
            placeholder="업무 제목 입력"
          />

          <label>담당자:</label>
          <select name="assignedTo" value={taskData.assignedTo || ""} onChange={handleChange}>
            <option value="">담당자 선택</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.username}
              </option>
            ))}
          </select>

          <label>작업 시작일:</label>
          <input type="date" name="startDate" value={taskData.startDate} onChange={handleChange} />

          <label>작업 마감일:</label>
          <input type="date" name="dueDate" value={taskData.dueDate} onChange={handleChange} />

          <label>업무 상태:</label>
          <select name="status" value={taskData.status} onChange={handleChange}>
            <option value="DRAFT">초안</option>
            <option value="EDITING">수정 중</option>
            <option value="TODO">할 일</option>
            <option value="IN_PROGRESS">진행 중</option>
            <option value="DONE">완료</option>
          </select>

          <label>작업 내용:</label>
          <div
            ref={contentRef}
            contentEditable
            className="editable-content"
            onInput={handleContentChange}
            placeholder="업무 내용을 입력하세요."
          ></div>

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
          {/* ✅ 색상 선택 기능 */}
          <label>색상 선택</label>
<div className="color-picker-container">
  <div
    className="color-box"
    style={{ backgroundColor: taskData.color }}
    onClick={() => document.getElementById("hiddenColorPicker").click()}
    title={`현재 색상: ${taskData.color}`}
  ></div>
  <input
    id="hiddenColorPicker"
    type="color"
    name="color"
    value={taskData.color}
    onChange={handleColorChange}
    className="hidden-color-picker"
  />
  <span className="color-code">{taskData.color.toUpperCase()}</span>
</div>

          <div className="modal-footer">
            <div className="modal-actions-left">
              <button className="icon-btn" onClick={() => setShowFileUpload(!showFileUpload)}>
                <FaPaperclip /> 파일 추가
              </button>
              {showFileUpload && <FileUpload projectId={projectId} onFileUploaded={handleFileUploaded} />}
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
