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
      const response = await axios.get(`http://localhost:8082/api/files/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      console.log("서버 응답 데이터:", response.data);

      // 파일 목록을 올바른 형식으로 변환 (fileId)
      const formattedFiles = response.data.map(file => ({
        fileId: file.id,  // file.id가 존재하는지 확인
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize || "알 수 없음", // 파일 크기
        uploader: file.uploader || "알 수 없음", // 등록자
        uploadDate: file.uploadDate || "알 수 없음" // 등록일
      }));


      //  setFiles(response.data);
      setFiles(response.data.map(file => ({
        fileId: file.fileId,
        fileName: file.fileName,
        fileUrl: file.fileUrl
      })));
    } catch (error) {
      console.error("❌ 파일 목록 불러오기 실패:", error);
    }
  };


  const handleFileSelect = (file) => {
    setSelectedFiles((prevSelected) =>
      prevSelected.includes(file)
        ? prevSelected.filter((f) => f.fileUrl !== file.fileUrl)
        : [...prevSelected, file]
    );
  };


  const downloadSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      alert("다운로드할 파일을 선택하세요!");
      return;
    }

    // try {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 파일 URL을 인코딩하여 백엔드 요청
    const encodedFileIds = selectedFiles.map(file => encodeURIComponent(file.fileUrl)).join("&fileIds=");
    const downloadUrl = `http://localhost:8082/api/files/download?fileIds=${encodedFileIds}`;

    console.log("다운로드 요청 URL:", downloadUrl);

    if (selectedFiles.length === 1) {
      // 한 개만 선택했을 경우 개별 파일 다운로드
      const file = selectedFiles[0];
      const link = document.createElement("a");
      link.href = file.fileUrl;
      link.download = file.fileName || "downloaded_file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // 여러 개 선택했을 경우 ZIP 파일 다운로드 요청
      const fileIds = selectedFiles.map(file => file.fileId).join("&fileIds=");
      const downloadUrl = `http://localhost:8082/api/files/download?fileIds=${fileIds}`;

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
    setPreviewFile(file);
  };

    // ✅ 파일을 클릭하면 즉시 다운로드하는 함수
    const handleFileDownload = (file) => {
      const link = document.createElement("a");
      link.href = file.fileUrl; // 서버에서 제공하는 파일 URL 사용
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
                    checked={selectedFiles.some(f => f.fileUrl === file.fileUrl)}
                    onChange={() => handleFileSelect(file)}
                  />
                </td>
                <td className="file-item">
                  {/* <span onClick={() => handlePreview(file)} className="file-name">
                    {file.fileName}
                  </span> */}
                                    {/* ✅ 클릭 시 즉시 다운로드 */}
                                    <span onClick={() => handleFileDownload(file)} className="file-name">
                    {file.fileName}
                  </span>
                </td>
                {/* <td>{file.fileSize}</td>
              <td>{file.uploader}</td>
              <td>{file.uploadDate}</td> */}
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
