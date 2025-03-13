import React, { useState, useEffect } from 'react';
import TaskDetailModal from './TaskDetailModal'; // TaskDetailModal 임포트
import '../styles/GanttChart.css';

const GanttChart = ({ tasks }) => {
  const [viewMode, setViewMode] = useState('week');
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [chartHeight, setChartHeight] = useState("400px");
  const [selectedTask, setSelectedTask] = useState(null); // 선택된 태스크 상태 추가
  const today = new Date();

  const isTaskOnDate = (date, task) => {
    const taskStart = new Date(task.start).setHours(0, 0, 0, 0);
    const taskEnd = new Date(task.end).setHours(23, 59, 59, 999);
    const checkDate = new Date(date).setHours(12, 0, 0, 0);
    return checkDate >= taskStart && checkDate <= taskEnd;
  };

  const formattedTasks = tasks.map((task) => ({
    id: task.id,
    name: task.name,
    start: new Date(task.startDate), // GanttChart에서 사용하는 속성
    end: new Date(task.dueDate),     // GanttChart에서 사용하는 속성
    startDate: task.startDate,       // TaskDetailModal에서 사용하는 원본 속성
    dueDate: task.dueDate,           // TaskDetailModal에서 사용하는 원본 속성
    color: task.color || "#ff99a5",
    assignedTo: task.assignedTo,     // 담당자 객체 포함 (id와 username 포함)
    status: task.status,             // 상태 포함
    description: task.description,   // 설명 포함
  }));

  function getStartOfWeek(date) {
    const start = new Date(date);
    const dayOfWeek = start.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  const getWeekDates = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      date.setHours(0, 0, 0, 0);
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: new Date(date),
      };
    });
  };

  const getMonthDates = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const dates = [];
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) dates.push(null);
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      dates.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }
    return dates;
  };

  const getYearMonths = () => {
    return Array.from({ length: 12 }, (_, index) => {
      const monthDate = new Date(currentYear, index, 1);
      return {
        name: monthDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        date: monthDate,
      };
    });
  };

  const isTaskInMonth = (monthDate, task) => {
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    return task.start <= monthEnd && task.end >= monthStart;
  };

  const calculateProgressBarStyle = (task, index) => {
    const taskStart = new Date(task.start);
    const taskEnd = new Date(task.end);
    const weekStart = new Date(currentWeekStart);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    if (taskEnd < weekStart || taskStart > weekEnd) {
      return { display: 'none' };
    }

    let adjustedTaskStart = new Date(Math.max(taskStart.getTime(), weekStart.getTime()));
    let adjustedTaskEnd = new Date(Math.min(taskEnd.getTime(), weekEnd.getTime()));
    adjustedTaskStart.setHours(0, 0, 0, 0);
    adjustedTaskEnd.setHours(23, 59, 59, 999);

    const totalDaysInWeek = 7;
    const dayWidth = 100 / totalDaysInWeek;
    const offsetDays = (adjustedTaskStart - weekStart) / (1000 * 60 * 60 * 24);
    const offset = offsetDays * dayWidth;
    const taskDurationDays = Math.floor((adjustedTaskEnd - adjustedTaskStart) / (1000 * 60 * 60 * 24)) + 1;
    const width = Math.min(100 - offset, taskDurationDays * dayWidth);

    return {
      position: 'absolute',
      top: `${60 + index * 30}px`,
      left: `${offset}%`,
      width: `${width}%`,
      backgroundColor: task.color || "#ff99a5",
      height: '12px',
      borderRadius: '6px',
      cursor: 'pointer', // 클릭 가능하도록 커서 추가
    };
  };

  const handlePreviousWeek = () => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() - 7)));
  const handleNextWeek = () => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() + 7)));
  const handlePreviousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const handlePreviousYear = () => setCurrentYear(currentYear - 1);
  const handleNextYear = () => setCurrentYear(currentYear + 1);

  const handleTaskClick = (task) => {
    setSelectedTask(task); // 클릭된 태스크를 상태에 저장
  };

  const handleCloseModal = () => {
    setSelectedTask(null); // 모달 닫기
  };

  useEffect(() => {
    if (tasks.length > 6) {
      setChartHeight(`${400 + (tasks.length - 6) * 60}px`);
    } else {
      setChartHeight("400px");
    }
  }, [tasks]);

  return (
    <div className="gantt-chart">
      <div className="view-mode-buttons">
        <button className={`view-button ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Week</button>
        <button className={`view-button ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Month</button>
        <button className={`view-button ${viewMode === 'year' ? 'active' : ''}`} onClick={() => setViewMode('year')}>Year</button>
      </div>

      {viewMode === 'week' && (
        <>
          <div className="week-navigation">
            <button className="week-nav" onClick={handlePreviousWeek}>{'<'}</button>
            <span>
              {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} ~{" "}
              {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </span>
            <button className="week-nav" onClick={handleNextWeek}>{'>'}</button>
          </div>

          <div className="calendar">
            {getWeekDates().map((day, index) => (
              <div key={index} className="calendar-day">
                <div className="day-name">{day.day}</div>
                <div className="day-date">{day.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
              </div>
            ))}
            {formattedTasks.map((task, index) => {
              const progressBarStyle = calculateProgressBarStyle(task, index);
              return (
                <div
                  key={task.id}
                  className="progress-bar"
                  style={progressBarStyle}
                  onClick={() => handleTaskClick(task)} // 클릭 이벤트 추가
                >
                  {task.name}
                </div>
              );
            })}
          </div>
        </>
      )}

      {viewMode === 'month' && (
        <div className="month-calendar">
          <div className="month-header">
            <button className="month-nav" onClick={handlePreviousMonth}>{'<'}</button>
            <div className="month-title">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            <button className="month-nav" onClick={handleNextMonth}>{'>'}</button>
          </div>

          <div className="calendar-grid">
            {getMonthDates().map((date, index) => (
              <div key={index} className="calendar-day">
                {date && (
                  <>
                    <div className="day-date">{date.getDate()}</div>
                    <div className="task-indicator-container">
                      {formattedTasks.map((task) => (
                        isTaskOnDate(date, task) ? (
                          <div
                            key={task.id}
                            className="task-indicator task-bar"
                            style={{ backgroundColor: task.color, cursor: 'pointer' }} // 클릭 가능하도록 커서 추가
                            onClick={() => handleTaskClick(task)} // 클릭 이벤트 추가
                          />
                        ) : null
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'year' && (
        <div className="year-calendar">
          <div className="year-header">
            <button className="year-nav" onClick={handlePreviousYear}>{'<'}</button>
            <div className="year-title">{currentYear}</div>
            <button className="year-nav" onClick={handleNextYear}>{'>'}</button>
          </div>

          <div className="year-grid">
            {getYearMonths().map((month, index) => (
              <div key={index} className="year-month">
                <div className="month-name">{month.name}</div>
                <div className="month-tasks">
                  {formattedTasks.map((task) => (
                    isTaskInMonth(month.date, task) ? (
                      <div
                        key={task.id}
                        className="task-indicator task-circle"
                        style={{ backgroundColor: task.color, cursor: 'pointer' }} // 클릭 가능하도록 커서 추가
                        onClick={() => handleTaskClick(task)} // 클릭 이벤트 추가
                      />
                    ) : null
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TaskDetailModal 추가 */}
      {selectedTask && <TaskDetailModal task={selectedTask} onClose={handleCloseModal} />}
    </div>
  );
};

export default GanttChart;