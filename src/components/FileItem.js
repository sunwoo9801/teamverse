import React from "react";
import "../styles/FileItem.css";

const FileItem = ({ file, onPreview }) => {
  return (
    <div className="file-item" onClick={() => onPreview(file)}>
      <p className="file-name">📄 {file.name}</p>
    </div>
  );
};

export default FileItem;
