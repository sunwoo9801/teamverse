import React, { useState } from 'react';
import '../styles/FileManager.css';

const FileManager = () => {
  const [files, setFiles] = useState([]);

  const handleUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files).map((file) => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2), // 파일 크기 (KB 단위)
      lastModified: new Date(file.lastModified).toLocaleDateString(),
    }));
    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
  };

  const handleDelete = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div className="file-manager">
      <h3>File Manager</h3>
      <input
        type="file"
        id="file-upload"
        multiple
        onChange={handleUpload}
        className="file-input"
      />
      <label htmlFor="file-upload" className="file-upload-label">
        Upload Files
      </label>
      {files.length > 0 ? (
        <ul className="file-list">
          {files.map((file, index) => (
            <li key={index} className="file-item">
              <span className="file-name" title={file.name}>
                {file.name}
              </span>
              <span className="file-size">{file.size} KB</span>
              <span className="file-date">{file.lastModified}</span>
              <button
                className="delete-button"
                onClick={() => handleDelete(file.name)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-files">No files uploaded.</p>
      )}
    </div>
  );
};

export default FileManager;
