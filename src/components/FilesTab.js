import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAccessToken } from "../utils/authUtils";
import FilePreview from "./FilePreview"; // 미리보기 컴포넌트
import { FaFileAlt, FaDownload } from "react-icons/fa"; // 세련된 아이콘 추가
import "../styles/FilesTab.css";

const FilesTab = ({ projectId }) => {
  const [files, setFiles] = useState([]); // 파일 목록
  const [selectedFiles, setSelectedFiles] = useState([]); // 선택한 파일 목록
  const [previewFile, setPreviewFile] = useState(null); // 미리보기할 파일 상태


  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  // 프로젝트 ID에 해당하는 파일 목록 불러오기
  const fetchFiles = async () => {
  const token = getAccessToken();
  try {
    const response = await axios.get(`https://teamverse.onrender.com/api/files/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

    console.log("서버 응답 데이터:", response.data);

    setFiles(response.data.map(file => ({
      fileId: file.fileId,
      fileName: file.fileName,
      fileUrl: file.fileUrl.startsWith("http") 
        ? file.fileUrl 
        : `https://teamverse.onrender.com${file.fileUrl}`,  // 정적 경로 포함
    })));
  } catch (error) {
    console.error("❌ 파일 목록 불러오기 실패:", error);
  }
};

  


  const handleFileSelect = (file) => {
    setSelectedFiles((prevSelected) =>
      prevSelected.some((f) => f.fileId === file.fileId)
        ? prevSelected.filter((f) => f.fileId !== file.fileId)
        : [...prevSelected, file]
    );
  };
  

  const downloadSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      alert("다운로드할 파일을 선택하세요!");
      return;
    }
  
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
  
    // 선택한 파일 개수에 따라 다르게 동작
    if (selectedFiles.length === 1) {
      // 단일 파일 다운로드
      const file = selectedFiles[0];
      handleFileDownload(file);
    } else {
      // ZIP 다운로드 요청
      const fileIds = selectedFiles.map(file => file.fileId).join(",");
      const downloadUrl = `https://teamverse.onrender.com/api/files/download?fileIds=${fileIds}`;
  
      console.log("ZIP 다운로드 요청 URL:", downloadUrl);
  
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "downloaded_files.zip");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  

  // 선택한 파일을 미리보기로 설정하는 함수
  const handlePreview = (file) => {
    const absoluteUrl = file.fileUrl.startsWith("http")
      ? file.fileUrl
      : `https://teamverse.onrender.com${file.fileUrl}`;
  
    setPreviewFile({ ...file, fileUrl: absoluteUrl });
  };
  
  
    // 파일을 클릭하면 즉시 다운로드하는 함수
    const handleFileDownload = (file) => {
      const absoluteUrl = file.fileUrl.startsWith("http") 
        ? file.fileUrl 
        : `https://teamverse.onrender.com${file.fileUrl}`;
    
      const link = document.createElement("a");
      link.href = absoluteUrl;
      link.download = file.fileName || "downloaded_file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    
    

  return (
    <div className="files-tab">
      <h2>파일 목록</h2>

      {/* 파일 목록을 테이블로 표시 */}
      <table className="file-table">
        <thead>
          <tr>
            <th> <FaFileAlt className="file-icon" />
            </th>
            <th>파일명</th>
          </tr>
        </thead>
        <tbody>
  {files.length === 0 ? (
    <tr>
      <td colSpan="5">📌 프로젝트에 등록된 파일이 없습니다.</td>
    </tr>
  ) : (
    files.map((file, index) => (
      <tr key={index}>
        <td>
          <input
            type="checkbox"
            checked={selectedFiles.some(f => f.fileId === file.fileId)}
            onChange={() => handleFileSelect(file)}
          />
        </td>
        <td className="file-item">
          <span onClick={() => handlePreview(file)} className="file-name">
            {file.fileName}
          </span>
        </td>
      </tr>
    ))
  )}
</tbody>

      </table>

      {/* 다운로드 버튼 */}
      <button onClick={downloadSelectedFiles} className="download-btn">
        <FaDownload /> 다운로드
      </button>
      
      {previewFile && <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
};


export default FilesTab;
