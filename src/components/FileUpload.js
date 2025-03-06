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

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };
  
  const handleUpload = async () => {
    console.log("현재 프로젝트 ID (버튼 클릭 시):", projectId); // 디버깅 로그

    if (selectedFiles.length === 0) {
      alert("업로드할 파일을 선택하세요!");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("file", file));

    if (!projectId) {  // currentProjectId 대신 projectId 사용
      alert("프로젝트 ID를 찾을 수 없습니다. 올바른 프로젝트를 선택해주세요.");
      setUploading(false);
      return;
    }

    formData.append("projectId", projectId);  // projectId를 동적으로

    try {
      const token = getAccessToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        setUploading(false);
        return;
      }

      console.log("파일 업로드 요청: Authorization 헤더 확인", token);
      console.log("현재 프로젝트 ID:", projectId); // 디버깅용 로그

      const response = await axios.post("http://localhost:8082/api/files/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      const uploadedFileUrl = response.data.fileUrl;
      console.log("업로드된 파일 URL:", uploadedFileUrl);

      if (onFileUploaded && uploadedFileUrl) {
        onFileUploaded(uploadedFileUrl);
      }

      alert("파일이 성공적으로 업로드되었습니다!");
      setSelectedFiles([]);

      // 파일 업로드 후 목록 자동 갱신
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
      <button className="file-attach-button" onClick={triggerFileInput}>📎 파일 첨부</button>
      <input type="file" multiple onChange={handleFileChange} hidden ref={fileInputRef} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "업로드 중..." : "파일 업로드"}
      </button>
      <div className="file-list-container">
        <h3>📂 업로드된 파일 목록</h3>
        <div className="file-list">
          {selectedFiles.length > 0 ? (
            selectedFiles.map((file, index) => (
              <FileItem key={index} file={file} onPreview={handlePreview} />
            ))
          ) : (
            <p className="no-files">업로드된 파일이 없습니다.</p>
          )}
        </div>
      </div>
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
