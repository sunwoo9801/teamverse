import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/TaskModal.css";
import { getAccessToken } from "../utils/authUtils";
import { FaMapMarkerAlt, FaTimes, FaMapMarkedAlt } from "react-icons/fa";
import { searchPlaces } from "../api/places"; // ✅ 백엔드 API 호출
import ReactMarkdown from "react-markdown"; // ✅ Markdown 지원 라이브러리 추가
import remarkGfm from "remark-gfm"; // ✅ 테이블, 링크 지원 추가


const TaskModal = ({ onClose, projectId, refreshTasks, editTask }) => {
  const isEditMode = !!editTask;

  const [taskData, setTaskData] = useState({
    name: editTask ? editTask.name : "",
    assignedTo: editTask ? editTask.assignedTo : "",
    startDate: editTask ? editTask.startDate : "",
    dueDate: editTask ? editTask.dueDate : "",
    description: editTask && editTask.description ? editTask.description : "",  // 🔥 초기값을 빈 문자열("")로 설정
    descriptionElements: editTask ? [<div dangerouslySetInnerHTML={{ __html: editTask.description }} />] : [],
    status: editTask ? editTask.status : "TODO",
    locations: editTask ? editTask.locations || [] : [],
  });




  const [showPlaceSearch, setShowPlaceSearch] = useState(false);
  const [places, setPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCache, setSearchCache] = useState({});
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(""); // ✅ API 키 상태 추가
  const renderDescriptionWithPlaces = (description) => {
    return description.split("\n").map((line, index) => {
      if (line.includes("embedded-place-card")) {
        return <div key={index} dangerouslySetInnerHTML={{ __html: line }} />;
      }
      return <p key={index}>{line}</p>;
    });
  };


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
      });
    }

    const fetchGoogleMapsApiKey = async () => {
      const token = getAccessToken(); //  JWT 토큰 가져오기
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

  // ✅ 입력값 변경 핸들러 (모든 입력 필드)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: value, // ✅ 입력된 필드(name)에 맞게 데이터 업데이트
    }));
  };


  // **description에 직접 입력 가능하도록 수정**
  const handleTextChange = (e) => {
    setTaskData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  const addPlaceToTask = (place) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
      place.name
    )}&zoom=15&size=600x300&maptype=roadmap&markers=color:red|${encodeURIComponent(place.name)}&key=${googleMapsApiKey}`;

    const placeAddress = place.formatted_address || place.vicinity || "주소 정보 없음";

    // ✅ 기존 입력 내용 + 장소 정보를 함께 유지
    const placeHTML = `
      <div class="embedded-place-card">
        <img src="${staticMapUrl}" alt="${place.name}" class="place-map-thumbnail" />
        <div class="place-info">
          <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="place-name">
            <strong>${place.name}</strong>
          </a>
          <p class="place-address">${placeAddress}</p>
        </div>
        <button class="delete-place-btn" onclick="removePlace('${place.name}')">❌</button>
      </div>
    `;

    setTaskData((prev) => ({
      ...prev,
      description: prev.description + `<br/>` + placeHTML, // ✅ 기존 내용 유지 + 장소 추가
      descriptionElements: [...prev.descriptionElements, <div dangerouslySetInnerHTML={{ __html: placeHTML }} />],
    }));

    setShowPlaceSearch(false);
  };

    // ✅ **장소 삭제 기능 (🔥 기존 removePlace 문제 해결)**
  const removePlace = (placeName) => {
    setTaskData((prev) => ({
      ...prev,
      locations: prev.locations.filter((place) => place.name !== placeName),
    }));
  };






  // ✅ 검색어 입력 시 자동으로 장소 검색 실행 (캐싱 적용)
  useEffect(() => {
    if (searchQuery.trim()) {
      setPlaces([]); // 🔥 기존 장소 목록을 초기화하여 UI 반영

      if (searchCache[searchQuery]) {
        console.log("🔍 캐시에서 검색 결과 가져옴:", searchCache[searchQuery]);
        setPlaces(searchCache[searchQuery]); // 🔥 즉시 UI 반영
      } else {
        const delayDebounceFn = setTimeout(async () => {
          try {
            console.log(`🔍 장소 검색 실행: ${searchQuery}`);
            const results = await searchPlaces(searchQuery);

            // ✅ API 응답 데이터 확인 로그
            console.log("📌 API에서 받은 장소 목록:", results);

            setPlaces(results); // 🔥 검색 결과 즉시 UI 반영
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
  }, [searchQuery]); // ✅ searchCache 제거! -> 검색어가 바뀔 때마다 실행되도록 설정


  const handleSubmit = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:8082/api/user/tasks/${editTask.id}`,
          { ...taskData, projectId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        alert("업무가 성공적으로 수정되었습니다!");
      } else {
        await axios.post(
          "http://localhost:8082/api/user/tasks",
          { ...taskData, projectId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
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

          <label>담당자:</label>
          <select name="assignedTo" value={taskData.assignedTo} onChange={handleChange}>
            <option value="">담당자 선택</option>
            <option value="1">사용자 1</option>
            <option value="2">사용자 2</option>
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

          {/* ✅ description 입력칸 (contentEditable 유지) */}
          {/* ✅ description 입력칸 (contentEditable) */}
          <label>작업 내용:</label>
          <div
            className="description-editor"
            contentEditable
            suppressContentEditableWarning={true}
            onInput={(e) => {
              setTaskData({ ...taskData, description: e.currentTarget.innerHTML });
            }}
            style={{
              minHeight: "100px",
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "5px",
              backgroundColor: "#fff",
              outline: "none",
              whiteSpace: "pre-wrap", // 줄바꿈 유지
            }}
            dangerouslySetInnerHTML={{ __html: taskData.description }} // ✅ 기존 HTML 반영
          />


          {/* ✅ description 미리보기 (그대로 유지) */}
          <div className="description-preview">
            {taskData.descriptionElements.map((element, index) => (
              <div key={index}>{element}</div>
            ))}
          </div>


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


          <div className="modal-actions">
            <button onClick={onClose}>취소</button>
            <button onClick={handleSubmit}>{isEditMode ? "수정" : "등록"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
