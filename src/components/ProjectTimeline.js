import React from 'react';
import '../styles/ProjectTimeline.css';

const ProjectTimeline = ({ tasks }) => {
  const calculateBarPosition = (task, timelineStart, totalDays) => {
    const taskStart = new Date(task.start).getTime();
    const taskEnd = new Date(task.end).getTime();
    const timelineStartMs = new Date(timelineStart).getTime();

    const startOffset = ((taskStart - timelineStartMs) / (1000 * 60 * 60 * 24)) * (100 / totalDays);
    const width = ((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) * (100 / totalDays);

    return {
      left: `${startOffset}%`,
      width: `${width}%`,
    };
  };

  const timelineStart = '2025-01-01'; // 타임라인의 시작 날짜
  const timelineEnd = '2025-03-31'; // 타임라인의 종료 날짜
  const totalDays =
    (new Date(timelineEnd).getTime() - new Date(timelineStart).getTime()) / (1000 * 60 * 60 * 24);

  return (
    <div className="project-timeline">
      <div className="timeline-header">
        <span>{timelineStart}</span>
        <span>{timelineEnd}</span>
      </div>
      <div className="timeline">
        {tasks.map((task) => {
          const positionStyle = calculateBarPosition(task, timelineStart, totalDays);
          return (
            <div
              key={task.id}
              className="timeline-task"
              style={{
                ...positionStyle,
                backgroundColor: task.color,
              }}
            >
              <span className="task-name">{task.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTimeline;
