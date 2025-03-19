import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import FileUpload from "./FileUpload";
import "../styles/PostTodoModal.css";
import { FaPaperclip, FaMapMarkerAlt, FaTrashAlt, FaFileAlt } from "react-icons/fa"; // 파일 & 장소 아이콘 추가
import { searchPlaces } from "../api/places"; // 장소 검색 API import
import ModalNav from "./ModalNav";
import parse from "html-react-parser";
import { getStompClient } from "../api/websocket"; // WebSocket 클라이언트 가져오기


const PostTodoModal = ({ onClose, initialTab = "post", refreshFeed, projectId }) => { // projectId 추가
  const [activeTab, setActiveTab] = useState(initialTab);
  const [title, setTitle] = useState(""); // 제목 추가
  const [postContent, setPostContent] = useState(""); // 글 내용 저장
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false); // 📌 파일 업로드 창 상태 추가
  const contentRef = useRef(null); // contentEditable div 참조
  const isModal = true;  // 모달에서만 삭제 버튼을 보이게 하는 변수 추가!

  // 장소 추가
  const [showPlaceSearch, setShowPlaceSearch] = useState(false);
  const [places, setPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCache, setSearchCache] = useState({});
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState("");

//  모달 바깥을 클릭하면 검색창 닫기
const closePlaceSearch = (e) => {
  if (e.target.classList.contains("place-search-overlay")) {
    setShowPlaceSearch(false);
  }
};

  // Google Maps API 키 가져오기
  useEffect(() => {
    const fetchGoogleMapsApiKey = async () => {
      const token = getAccessToken();
      try {
        const response = await axios.get("http://localhost:8082/api/places/google-maps-key", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setGoogleMapsApiKey(response.data);
      } catch (error) {
        console.error("❌ Google Maps API 키 가져오기 실패:", error);
      }
    };

    fetchGoogleMapsApiKey();
  }, []);

  // 장소 검색 useEffect
  useEffect(() => {
    if (searchQuery.trim()) {
      if (searchCache[searchQuery]) {
        setPlaces(searchCache[searchQuery]);
      } else {
        const delayDebounceFn = setTimeout(async () => {
          try {
            const results = await searchPlaces(searchQuery);
            setPlaces(results);
            setSearchCache(prevCache => ({ ...prevCache, [searchQuery]: results }));
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

  const addPlaceToTask = (place) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(place.name)}&zoom=15&size=600x300&maptype=roadmap&markers=color:red|${encodeURIComponent(place.name)}&key=${googleMapsApiKey}`;
    const placeAddress = place.formatted_address || place.vicinity || "주소 정보 없음";

    // HTML 마크업 생성 (앵커 태그 포함)
    const placeHTML = `<p>📍 <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer">${place.name}</a> (${placeAddress})</p>`;

   // 상태 업데이트 시 HTML 포함
   setTaskData(prev => ({
    ...prev,
    description: prev.description + placeHTML,
  }));

  // contentEditable에도 반영
  if (contentRef.current) {
    contentRef.current.innerHTML += placeHTML;
  }
  setShowPlaceSearch(false);
  };

//      setTaskData(prev => ({
//        ...prev,
//        description: prev.description + `\n\n📍 ${place.name} (${placeAddress})`
//      }));
//
//      // contentEditable div에도 반영
//      if (contentRef.current) {
//        contentRef.current.innerHTML += `<p>📍 <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer">${place.name}</a> (${placeAddress})</p>`;
//      }
//      setShowPlaceSearch(false);
//    };

  const [taskData, setTaskData] = useState({
    name: "",
    assignedTo: "",
    startDate: "",
    dueDate: "",
    status: "TODO",
    description: "",
    color: "#ff99a5",
  });

  const [tasks, setTasks] = useState([]); // 작업 목록 상태 추가
  const [teamMembers, setTeamMembers] = useState([]); // 팀원 목록 상태 추가

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = taskData.description || "";
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const token = getAccessToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8082/api/user/projects/${projectId}/team-members`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setTeamMembers(response.data);
      } catch (error) {
        console.error("❌ 팀원 목록 불러오기 실패:", error);
      }
    };

    fetchTeamMembers();
  }, [projectId]);

  // 모달 닫기 함수
  const handleClose = () => {
    console.log("모달 닫기");
    onClose();
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // description 입력 필드 값 변경 시 contentRef에도 반영
    if (name === "description" && contentRef.current) {
      contentRef.current.innerHTML = value;
    }
  };


  // 파일 업로드 시 task.description에도 추가되도록 수정
  const handleFileUploaded = (fileUrl) => {
    const absoluteUrl = fileUrl.startsWith("http") ? fileUrl : `http://localhost:8082${fileUrl}`;
    setUploadedFiles((prevFiles) => [...prevFiles, { url: absoluteUrl }]);
  
    if (contentRef.current) {
      const fileName = absoluteUrl.split("/").pop();
      const isImage = /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(absoluteUrl);
  
      if (isImage) {
        const imgElement = document.createElement("img");
        imgElement.src = absoluteUrl;
        imgElement.alt = fileName;
        imgElement.style.maxWidth = "100%";
        imgElement.style.height = "auto";
        imgElement.style.objectFit = "contain";
        contentRef.current.appendChild(imgElement);
      } else {
        const fileElement = document.createElement("a");
        fileElement.href = absoluteUrl;
        fileElement.innerText = `📄 ${fileName}`;
        fileElement.download = fileName;
        contentRef.current.appendChild(fileElement);
      }
    }
  };
  

  

  useEffect(() => {
    console.log("📌 현재 postContent 상태:", postContent);
  }, [postContent]);

  // handleSubmit에서 업무(Task)도 description을 contentEditable에서 가져오도록 수정
  const handleSubmit = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    // contentEditable div의 내용을 가져와서 description에 저장
    const content = contentRef.current ? contentRef.current.innerHTML.trim() : "";

    try {
      if (activeTab === "post") {
        if (!title.trim()) {
          alert("제목을 입력하세요.");
          return;
        }

        await axios.post(
          "http://localhost:8082/api/activity/post",
          {
            title: title,
            content: content,
            projectId: projectId,
            files: uploadedFiles.map(file => file.url),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        alert("게시글이 성공적으로 등록되었습니다!");
      } else if (activeTab === "task") {
        // 업무 제목만 입력되어도 등록할 수 있도록, 필수값에 기본값을 할당
        if (!taskData.name.trim()) {
          alert("업무 제목을 입력하세요.");
          return;
        }
        // 기본값 할당 (예: 오늘 날짜로 설정)
        const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD" 형식
        const updatedTaskData = {
          ...taskData,
          description: content, // contentEditable의 내용, 없으면 빈 문자열
          startDate: taskData.startDate || todayStr,
          dueDate: taskData.dueDate || todayStr,
          projectId,
          files: uploadedFiles.map(file => file.url)
        };
        await axios.post(
          "http://localhost:8082/api/user/tasks",
          updatedTaskData,
          {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            withCredentials: true,
            files: uploadedFiles.map(file => file.url),
          }
        );
        alert("업무가 성공적으로 등록되었습니다!");
      }

      refreshFeed();
      onClose();
    } catch (error) {
      console.error("❌ 등록 실패:", error);
      alert("등록에 실패했습니다.");
    }
  };


  return (
    <div className="post-todo-modal-overlay">
      <div className="post-todo-modal-container">
        <div className="post-todo-modal-content">
          {/* 네비게이션 추가 */}
          <ModalNav activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* 글 작성 UI */}
          {activeTab === "post" && (
            <>
              {/* <h2>글 작성</h2> */}
              <input type="text" placeholder="제목 입력" value={title} onChange={(e) => setTitle(e.target.value)} />

              {/* contentEditable div 사용 */}
              <div
                ref={contentRef}
                contentEditable
                className="post-todo-editable-content"
                placeholder="게시글 내용을 입력하세요."
              ></div>
            </>
          )}


          {/* 업무 추가 UI */}
          {activeTab === "task" && (
  <div className="task-section">
    {/* <h2>📝 업무 추가</h2> */}

    <label>업무 제목:</label>
    <input type="text" name="name" value={taskData.name} onChange={handleChange} placeholder="업무 제목 입력" />

    <label>담당자:</label>
    <select name="assignedTo" value={taskData.assignedTo} onChange={handleChange}>
      <option value="">담당자 선택</option>
      {teamMembers.map((member) => (
        <option key={member.id} value={member.id}>{member.username}</option>
      ))}
    </select>

    <label>📅 작업 시작일:</label>
    <input type="date" name="startDate" value={taskData.startDate} onChange={handleChange} />

    <label>📅 작업 마감일:</label>
    <input type="date" name="dueDate" value={taskData.dueDate} onChange={handleChange} />

    <label>📌 업무 상태:</label>
    <select name="status" className="task-status-dropdown" value={taskData.status} onChange={handleChange}>
      <option value="DRAFT">초안</option>
      <option value="EDITING">수정 중</option>
      <option value="TODO">할 일</option>
      <option value="IN_PROGRESS">진행 중</option>
      <option value="DONE">완료</option>
    </select>

    <label>🖍 색상 선택:</label>
    <input type="color" name="color" value={taskData.color} onChange={handleChange} />

    <label>📝 작업 내용:</label>
    <div
      ref={contentRef}
      contentEditable
      className="task-description"
      placeholder="작업 내용을 입력하세요."
      onInput={() => {
        setTaskData((prev) => ({
          ...prev,
          description: contentRef.current.innerHTML, // 입력될 때 description 업데이트
        }));
      }}
    ></div>
          </div>
)}

          {/* 할 일 추가 UI */}
          {activeTab === "todo" && (
            <>
              {/* <h2>할 일 추가</h2> */}
              <input type="text" placeholder="할 일 입력" />
            </>
          )}

          {/* 📌 하단 버튼 영역 */}
          <div className="modal-footer">
            <div className="modal-actions-left">
              {/* 파일 추가 버튼 */}
              <button className="icon-btn" onClick={() => setShowFileUpload(!showFileUpload)}>
                <FaPaperclip /> 파일 추가
              </button>

              {/* 🔹 파일 추가 버튼 아래에서 FileUpload가 보이게 함 */}
              {showFileUpload && (
                <div className="file-upload-wrapper">
                  <FileUpload projectId={projectId} onFileUploaded={handleFileUploaded} />
                </div>
              )}
              <button className="icon-btn" onClick={() => setShowPlaceSearch(true)}>
                <FaMapMarkerAlt /> 장소 추가
              </button>
               {/* ✅ 장소 검색 모달 (토글 기능 추가) */}
    {showPlaceSearch && (
      <div className="place-search-overlay" onClick={closePlaceSearch}>
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
          {/* ✅ 닫기 버튼 추가 */}
          <button className="close-place-search" onClick={() => setShowPlaceSearch(false)}>닫기</button>
        </div>
      </div>
    )}
            </div>



            <div className="task-modal-actions-right">
              <button onClick={onClose}>취소</button>
              <button onClick={handleSubmit}>등록</button>
            </div>
          </div>

          {/* 📌 파일 업로드 UI 표시 */}
          {/* {showFileUpload && (
            <FileUpload onFileUploaded={handleFileUploaded} />
          )} */}


        </div>
      </div>
    </div>
  );
};

export default PostTodoModal;
