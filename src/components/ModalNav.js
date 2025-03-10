import React from "react";
import "../styles/ModalNav.css"; 

const ModalNav = ({ activeTab, setActiveTab }) => {
    return (
        <div className="modal-nav">
            <button className={activeTab === "post" ? "active" : ""} onClick={() => setActiveTab("post")}>
                글
            </button>
            <button className={activeTab === "task" ? "active" : ""} onClick={() => setActiveTab("task")}>
                업무
            </button>
            <button className={activeTab === "todo" ? "active" : ""} onClick={() => setActiveTab("todo")}>
                할 일
            </button>
        </div>
    );
};

export default ModalNav;
