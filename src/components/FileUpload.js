import React, { useState, useRef } from "react";
import axios from "axios";
import "../styles/FileUpload.css";
import { getAccessToken } from "../utils/authUtils";
import FileItem from "./FileItem";

const FileUpload = ({ onFileUploaded, projectId, fetchFiles }) => { // fetchFiles (파일 목록 갱신)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewMetadata, setPreviewMetadata] = useState({ name: "", size: 0 });
  const fileInputRef = useRef(null);


  // 파일 선택 시 자동 업로드 실행
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    await handleUpload(files);
  };


  // 파일 업로드 로직
  const handleUpload = async (selectedFiles) => {
    console.log("현재 프로젝트 ID:", projectId);

    if (!projectId) {
      alert("프로젝트 ID를 찾을 수 없습니다. 올바른 프로젝트를 선택해주세요.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("file", file));
    formData.append("projectId", projectId);

    try {
      const token = getAccessToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      console.log("파일 업로드 요청: Authorization 헤더 확인", token);
      const response = await axios.post("http://localhost:8082/api/files/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      console.log("업로드된 파일 URL:", response.data.fileUrl);
      alert("파일이 성공적으로 업로드되었습니다!");

      if (onFileUploaded) {
        onFileUploaded(response.data.fileUrl);
      }

      // 파일 업로드 후 목록 갱신
      if (fetchFiles) fetchFiles();
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      alert("파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };


  const handlePreview = (file) => {
    const fileURL = URL.createObjectURL(file);
    setPreviewFile(fileURL);
    setPreviewMetadata({ name: file.name, size: file.size });
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewMetadata({ name: "", size: 0 });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="file-upload-container">
      {/* 파일 추가 버튼 클릭 시 파일 선택창 열기 */}
      <button className="file-attach-button" onClick={triggerFileInput}>
        📎 파일 업로드
      </button>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      {previewFile && (
        <div className="file-preview-modal">
          <div className="file-preview-content">
            <button className="close-button" onClick={closePreview}>X</button>
            <img src={previewFile} alt="미리보기" className="preview-image" />
            <div className="file-info">
              <p>파일명: {previewMetadata.name}</p>
              <p>파일 크기: {previewMetadata.size} bytes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
