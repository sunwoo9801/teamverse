// Toolbar.js
import React from "react";

const Toolbar = ({ onPostClick, onTaskClick, onCalendarClick, onTodoClick }) => {
  return (
<div className="w-full bg-white border border-gray-300 rounded-lg">
{/* Toolbar */}
      <div className="flex items-center space-x-6 px-4 py-3 border-b border-gray-200">
        <button onClick={onPostClick} className="flex items-center space-x-2 text-gray-700 font-medium">
          <i className="fas fa-file-alt"></i>
          <span>글</span>
        </button>
        <button onClick={onTaskClick} className="flex items-center space-x-2 text-gray-700 font-medium">
          <i className="fas fa-list-ul"></i>
          <span>업무</span>
        </button>
        <button onClick={onCalendarClick} className="flex items-center space-x-2 text-gray-700 font-medium">
          <i className="far fa-calendar-alt"></i>
          <span>일정</span>
        </button>
        <button onClick={onTodoClick} className="flex items-center space-x-2 text-gray-700 font-medium">
          <i className="far fa-check-square"></i>
          <span>할 일</span>
        </button>
      </div>
      {/* Input Area */}
      <div className="p-4 flex items-center justify-between">
        <input
          type="text"
          placeholder="내용을 입력하세요."
          className="w-full text-gray-700 text-lg focus:outline-none"
        />
        <div className="flex space-x-3 text-gray-400">
          <i className="fas fa-paperclip"></i>
          <i className="far fa-image"></i>
          <i className="fas fa-font"></i>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
