import React from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto"; // Chart.js 자동 등록

const Statistics = ({ tasks }) => {
  // 상태별 개수 집계
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  // 차트 데이터
  const data = {
    labels: ["초안", "수정 중", "할 일", "진행 중", "완료"],
    datasets: [
      {
        data: [
          statusCounts["DRAFT"] || 0,
          statusCounts["EDITING"] || 0,
          statusCounts["TODO"] || 0,
          statusCounts["IN_PROGRESS"] || 0,
          statusCounts["DONE"] || 0,
        ],
        backgroundColor: ["#b2ca76", "#ffc45e", "#ffa0bb", "#b889fa", "#c14c4c"],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="statistics-container">
      {/* <h3 className="statistics-heading">📊 업무 상태 현황</h3> */}
      <div className="chart-box">
        <Pie data={data} />
      </div>
      <ul className="status-list">
        {Object.entries(statusCounts).map(([status, count]) => (
          <li key={status} className="status-item">
            <span className="status-label">{status}</span>: <strong>{count} 개</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Statistics;
