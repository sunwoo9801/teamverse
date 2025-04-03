import { useState } from "react";
import { FaTimes } from "react-icons/fa"; // 닫기 버튼 아이콘 추가

console.log("FaTimes 아이콘 테스트:", FaTimes);


const ProjectEditModal = ({ project, onClose, onSave }) => {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);
    const [startDate, setStartDate] = useState(project.startDate);
    const [endDate, setEndDate] = useState(project.endDate);

    const handleSave = () => {
        const updatedProject = { ...project, name, description, startDate, endDate };
        onSave(updatedProject);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                {/* 상단 제목 & 닫기 버튼 */}
                <div className="modal-header">
                    <h2>프로젝트 수정</h2>
                    <button className="close-button" onClick={onClose}>
                        <FaTimes size={24} color="black" />
                    </button>

                </div>

                <label className="modal-label">프로젝트명</label>
                <input className="modal-input" value={name} onChange={(e) => setName(e.target.value)} />
                <div>
                    <label className="modal-label">설명</label>
                    <textarea className="modal-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="modal-date-group">
                    <div>
                        <label className="modal-label">시작일</label>
                        <input type="date" className="modal-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="modal-label">마감일</label>
                        <input type="date" className="modal-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="save-button" onClick={handleSave}>저장</button>
                </div>
            </div>
        </div>
    );
};

export default ProjectEditModal;
