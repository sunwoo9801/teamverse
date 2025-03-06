import React from "react";
import "../styles/FilePreview.css";
import { FaDownload } from "react-icons/fa";



const FilePreview = ({ file, onClose }) => {
  if (!file) return null; // 파일이 없으면 미리보기 창을 표시하지 않음


  console.log("📌 미리보기 파일 정보:", file);


  const handleDownload = async () => {
    try {
      const response = await fetch(file.fileUrl);
      if (!response.ok) throw new Error("파일 다운로드 실패");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.fileName || "downloaded_file"; // 다운로드할 파일명 설정
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ 파일 다운로드 오류:", error);
      alert("파일 다운로드 중 오류가 발생했습니다.");
    }
  };


  return (
    <div className="file-preview-modal">
      <div className="file-preview-content">
        <button className="close-button" onClick={onClose}>X</button>
        {file.fileUrl.endsWith(".jpg") || file.fileUrl.endsWith(".png") || file.fileUrl.endsWith(".gif") ? (
          <img src={file.fileUrl} alt="미리보기" className="preview-image" />
        ) : (
          <p>📄 파일명 </p>
        )}


        {/* ✅ 항상 파일명을 표시하도록 수정 */}
        <div className="file-info">
          <p> {file.fileName || "알 수 없음"}</p>  {/* 파일명이 없을 경우 "알 수 없음" 출력 */}
        </div>
        <button className="download-button" onClick={handleDownload}>
          <FaDownload style={{ marginRight: "8px" }} /> 다운로드
        </button>      </div>
    </div>
  );
};

export default FilePreview;


