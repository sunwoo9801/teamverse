//import React, { useState } from "react";
//import axios from "axios";
//import { getAccessToken } from "../utils/authUtils";
//import "../styles/PostTodoModal.css";
//import ModalNav from "./ModalNav"; // 네비게이션 추가
//
//const PostTodoModal = ({ onClose, refreshFeed }) => {
//  const [activeTab, setActiveTab] = useState("post");
//  const [postContent, setPostContent] = useState(""); // 글 작성 데이터 추가
//
//
//  const handlePostSubmit = async () => {
//    if (!postContent.trim()) {
//      alert("⚠️ 내용을 입력하세요.");
//      return;
//    }
//
//    const token = getAccessToken();
//    if (!token) {
//      alert("로그인이 필요합니다.");
//      return;
//    }
//
//    try {
//      const response = await axios.post(
//        `http://localhost:8082/api/activity/post`,
//        {
//          title: title, // 🔵 제목을 JSON으로 포함
//          content: postContent,
//          projectId: projectId
//        },
//        {
//          headers: {
//            Authorization: `Bearer ${token}`,
//            "Content-Type": "application/json",
//          },
//          withCredentials: true,
//        }
//      );
//      alert("글이 등록되었습니다.");
//      refreshFeed((prev) => [response.data, ...prev]);
//      onClose();
//    } catch (error) {
//      console.error("❌ 글 등록 실패:", error);
//    }
//  };
//
//  return (
//    <div className="modal-overlay">
//      <div className="modal-container">
//        <div className="modal-content">
//          <ModalNav activeTab={activeTab} setActiveTab={setActiveTab} />
//
//          {/* 글 작성 UI */}
//          {activeTab === "post" && (
//            <>
//              <h2>글 작성</h2>
//              <textarea
//                placeholder="게시글 내용을 입력하세요."
//                value={postContent}
//                onChange={(e) => setPostContent(e.target.value)}
//              />
//              <div className="modal-actions">
//                <button onClick={onClose}>취소</button>
//                <button onClick={handlePostSubmit}>등록</button>
//              </div>
//            </>
//          )}
//        </div>
//      </div>
//    </div>
//  );
//};
//
//export default PostTodoModal;




import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import FileUpload from "./FileUpload";
import "../styles/PostTodoModal.css";
import ModalNav from "./ModalNav";
import { FaPaperclip, FaMapMarkerAlt, FaTrashAlt, FaFileAlt } from "react-icons/fa"; // 파일 & 장소 아이콘 추가
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
    console.log("📌 업로드된 파일 URL:", fileUrl);

    const isImage = /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(fileUrl);
    const fileName = fileUrl.split("/").pop();
    const absoluteUrl = fileUrl.startsWith("http") ? fileUrl : `http://localhost:8082${fileUrl}`;

    // removeFile 함수 추가 (파일 삭제 시 UI에서도 반영)
    const removeFile = (fileUrl, fileElement) => {
      console.log("📌 삭제할 파일:", fileUrl);

      setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.url !== fileUrl));

      if (fileElement) {
        fileElement.remove();
      }

      // contentEditable에서도 삭제 반영
      if (contentRef.current) {
        contentRef.current.innerHTML = contentRef.current.innerHTML.replace(fileElement.outerHTML, "");
      }

      // 업무(Task) 등록 시 description에서 파일 제거
      setTaskData((prev) => ({
        ...prev,
        description: contentRef.current.innerHTML,
      }));
    };


    setUploadedFiles((prevFiles) => [
      ...prevFiles,
      { url: absoluteUrl, isImage, fileName },
    ]);

    if (contentRef.current) {
      const newNode = document.createElement("div");
      newNode.className = "file-container";

      if (isImage) {
        newNode.innerHTML = `
        <img src="${absoluteUrl}" alt="업로드 이미지" class="uploaded-image" />
        ${isModal ? `<button class="delete-file-btn">🗑️</button>` : ""}
      `;
      } else {
        newNode.innerHTML = `
        <div class="file-preview">
          <a href="${absoluteUrl}" target="_blank" class="file-name">${fileName}</a>
          ${isModal ? `<button class="delete-file-btn">🗑️</button>` : ""}
        </div>
      `;
      }
      if (isModal) {
        newNode.querySelector(".delete-file-btn").addEventListener("click", () => {
          removeFile(absoluteUrl, newNode);
        });
      }

      contentRef.current.appendChild(newNode);


      // 파일 추가 후 description 업데이트
      setTaskData((prev) => ({
        ...prev,
        description: contentRef.current.innerHTML,
      }));
    }
  };

  useEffect(() => {
    console.log("📌 현재 postContent 상태:", postContent);
  }, [postContent]);


  // handleSubmit에서 contentEditable 내용을 postContent에 반영
  // const handleSubmit = async () => {
  //   const token = getAccessToken();
  //   if (!token) {
  //     alert("로그인이 필요합니다.");
  //     return;
  //   }

  //   // contentEditable div의 내용을 가져와서 postContent에 반영
  //   const content = contentRef.current ? contentRef.current.innerHTML.trim() : "";

  //   try {
  //     if (activeTab === "post") {
  //       if (!title.trim() || (!content && uploadedFiles.length === 0)) {
  //         alert("제목과 내용을 입력하세요.");
  //         return;
  //       }

  //       const response = await axios.post(
  //         "http://localhost:8082/api/activity/post",
  //         {
  //           title: title,
  //           content: content, // postContent 대신 content 사용
  //           projectId: projectId,
  //           files: uploadedFiles.map(file => file.url),
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             "Content-Type": "application/json",
  //           },
  //           withCredentials: true,
  //         }
  //       );

  //       console.log("🆕 서버에서 받은 새 피드:", response.data);

  //       // 중복 방지: 기존 목록에 동일한 ID가 있으면 추가하지 않음
  //       refreshFeed((prevActivities) => {
  //         const isDuplicate = prevActivities.some(activity => activity.id === response.data.id);
  //         if (isDuplicate) return prevActivities;
  //         return [response.data, ...prevActivities];
  //       });

  //     } else {
  //       await axios.post(
  //         "http://localhost:8082/api/user/tasks",
  //         {
  //           ...taskData,
  //           projectId: projectId
  //         },
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //           withCredentials: true,
  //         }
  //       );
  //     }

  //     alert("등록이 완료되었습니다!");
  //     refreshFeed();
  //     onClose();
  //   } catch (error) {
  //     console.error("❌ 등록 실패:", error);
  //     if (error.response) {
  //       console.error("📌 서버 응답 상태 코드:", error.response.status);
  //       console.error("📌 서버 응답 데이터:", error.response.data);
  //     }
  //     alert("등록에 실패했습니다.");
  //   }
  // };


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
        if (!title.trim() || (!content && uploadedFiles.length === 0)) {
          alert("제목과 내용을 입력하세요.");
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
        // 업무(Task) 등록 시 contentRef의 내용을 description으로 저장
        const response = await axios.post(
          "http://localhost:8082/api/user/tasks",
          {
            ...taskData,
            description: content, // `description`을 contentEditable에서 가져오기
            projectId
          },
          {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            withCredentials: true,
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
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          {/* 네비게이션 추가 */}
          <ModalNav activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* 글 작성 UI */}
          {activeTab === "post" && (
            <>
              <h2>글 작성</h2>
              <input type="text" placeholder="제목 입력" value={title} onChange={(e) => setTitle(e.target.value)} />

              {/* contentEditable div 사용 */}
              <div
                ref={contentRef}
                contentEditable
                className="editable-content"
                placeholder="게시글 내용을 입력하세요."
              ></div>
            </>
          )}


          {/* 업무 추가 UI */}
          {activeTab === "task" && (
            <>
              <h2>업무 추가</h2>
              <label>업무 제목:</label>
              <input type="text" name="name" value={taskData.name} onChange={handleChange} placeholder="업무 제목 입력" />

              <label>담당자:</label>
              <select name="assignedTo" value={taskData.assignedTo} onChange={handleChange}>
                <option value="">담당자 선택</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>{member.username}</option>
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
              {/* <textarea name="description" value={taskData.description} onChange={handleChange}></textarea> */}
              <div
                ref={contentRef}
                contentEditable
                className="editable-content"
                placeholder="작업 내용을 입력하세요."
                onInput={() => {
                  setTaskData((prev) => ({
                    ...prev,
                    description: contentRef.current.innerHTML, // 입력될 때 description 업데이트
                  }));
                }}
              ></div>

              <label>색상 선택</label>
              <input type="color" name="color" value={taskData.color} onChange={handleChange} />
            </>
          )}

          {/* 할 일 추가 UI */}
          {activeTab === "todo" && (
            <>
              <h2>할 일 추가</h2>
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
              <button className="icon-btn">
                <FaMapMarkerAlt /> 장소 추가
              </button>
            </div>



            <div className="modal-actions-right">
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
