import React, { useState, useEffect } from 'react';
import '../styles/GanttChart.css';


// ✅ 수정: Task 데이터를 props로 받아서 사용하도록 변경
const GanttChart = ({ tasks }) => {
  const [viewMode, setViewMode] = useState('week'); // ✅ 현재 보기 모드 (week, month, year)
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const today = new Date();

  const isTaskOnDate = (date, task) => {
    const taskStart = new Date(task.start).setHours(0, 0, 0, 0);
    const taskEnd = new Date(task.end).setHours(23, 59, 59, 999);
    const checkDate = new Date(date).setHours(12, 0, 0, 0); // ✅ 날짜 중앙으로 설정 (비교 오류 방지)

    return checkDate >= taskStart && checkDate <= taskEnd;
  };


  // Task 데이터를 받아서 Gantt 차트에 반영
  const formattedTasks = tasks.map((task) => ({
    id: task.id,
    name: task.name,
    start: new Date(task.startDate),  // ❌ startDate를 직접 변환 (undefined 가능성 있음)
    end: new Date(task.dueDate),      // ❌ dueDate를 직접 변환 (undefined 가능성 있음)
    color: task.color || "#ff99a5",
    
}));

  // ✅ 현재 주의 시작 날짜 계산
  function getStartOfWeek(date) {
    const start = new Date(date);
    const dayOfWeek = start.getDay(); // 현재 요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 월요일을 기준
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  // 주간 날짜 목록 생성
  const getWeekDates = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentWeekStart); // ✅ 현재 주 시작(월요일)에서 시작
      date.setDate(currentWeekStart.getDate() + i); // ✅ 하루씩 더하면서 한 주를 채움
      date.setHours(0, 0, 0, 0); // ✅ 00:00:00으로 초기화
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }), // 'Mon', 'Tue' 형태
        date: new Date(date), // ✅ Date 객체로 변환
      };
    });
  };

  // ✅ 월간 날짜 목록 생성
  const getMonthDates = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const dates = [];

    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      dates.push(null);
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      dates.push(date);
    }

    return dates;
  };
  // ✅ 이전/다음 주 & 월 이동 기능
  const handlePreviousWeek = () => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() - 7)));
  const handleNextWeek = () => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() + 7)));
  const handlePreviousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const handlePreviousYear = () => setCurrentYear(currentYear - 1);
  const handleNextYear = () => setCurrentYear(currentYear + 1);


  // Year 뷰 - 12개월 목록 생성
  const getYearMonths = () => {
    return Array.from({ length: 12 }, (_, index) => {
      const monthDate = new Date(currentYear, index, 1);
      return {
        name: monthDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        date: monthDate,
      };
    });
  };

  // Task가 특정 월에 포함되는지 확인하는 함수
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

    // ✅ 주간 범위를 벗어난 Task 숨기기
    if (taskEnd < weekStart || taskStart > weekEnd) {
        console.log(`❌ Task ${task.name} is out of range`);
        return { display: 'none' };
    }

    // ✅ 현재 주간에 맞게 `taskStart`, `taskEnd` 조정
    let adjustedTaskStart = new Date(Math.max(taskStart.getTime(), weekStart.getTime()));
    let adjustedTaskEnd = new Date(Math.min(taskEnd.getTime(), weekEnd.getTime()));

    adjustedTaskStart.setHours(0, 0, 0, 0);
    adjustedTaskEnd.setHours(23, 59, 59, 999);

    const totalDaysInWeek = 7;
    const dayWidth = 100 / totalDaysInWeek;

    // ✅ 시작 위치 계산
    const offsetDays = (adjustedTaskStart - weekStart) / (1000 * 60 * 60 * 24);
    const offset = offsetDays * dayWidth;

    // ✅ 정확한 기간 계산
    const taskDurationDays = Math.floor((adjustedTaskEnd - adjustedTaskStart) / (1000 * 60 * 60 * 24)) + 1;
    const width = Math.min(100 - offset, taskDurationDays * dayWidth);
    return {
        position: 'absolute',
        top: `${60 + index * 30}px`,
        left: `${offset}%`,
        width: `${width}%`,
        backgroundColor: task.color || "#ff99a5", // ✅ 선택한 색상 적용
        height: '12px',
        borderRadius: '6px',
    };
};




  useEffect(() => {
  }, [viewMode, currentWeekStart, tasks]);

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
            <button onClick={handlePreviousWeek}>&lt;</button>
            <span>
              {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} ~{" "}
              {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </span>
            <button onClick={handleNextWeek}>&gt;</button>
          </div>

          <div className="calendar">
  {getWeekDates().map((day, index) => (
    <div key={index} className="calendar-day">
      <div className="day-name">{day.day}</div>
      <div className="day-date">{day.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
    </div>
  ))}

  {/* ✅ 하나의 progress-bar로 이어지게 표시 */}
  {formattedTasks.map((task, index) => {
    const progressBarStyle = calculateProgressBarStyle(task, index);
    return (
        <div key={task.id} className="progress-bar" style={progressBarStyle}>
            {task.name}
        </div>
    );
})}
</div>



          {/* <div className="task-container">
            {formattedTasks.map((task) => {
                const progressBarStyle = calculateProgressBarStyle(task);
                return (
                    <div key={task.id} className="task">
                        <div className="progress-bar" style={progressBarStyle}>
                            <div className="progress">
                                <span className="task-name">{task.name}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div> */}
        </>
      )}

      {viewMode === 'month' && (
        <div className="month-calendar">
          <div className="month-header">
            <button className="month-nav" onClick={handlePreviousMonth}>&lt;</button>
            <div className="month-title">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            <button className="month-nav" onClick={handleNextMonth}>&gt;</button>
          </div>

          <div className="calendar-grid">
            {getMonthDates().map((date, index) => (
              <div key={index} className="calendar-day">
                {date && (
                  <>
                    <div className="day-date">{date.getDate()}</div>
                    <div className="task-indicator-container">
                      {formattedTasks.map((task) => {
                        return isTaskOnDate(date, task) ? (
                          <div key={task.id} className="task-indicator task-bar" style={{ backgroundColor: task.color }}></div>
                        ) : null;
                      })}
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
            <button className="year-nav" onClick={handlePreviousYear}>&lt;</button>
            <div className="year-title">{currentYear}</div>
            <button className="year-nav" onClick={handleNextYear}>&gt;</button>
          </div>

          <div className="year-grid">
            {getYearMonths().map((month, index) => (
              <div key={index} className="year-month">
                <div className="month-name">{month.name}</div>
                <div className="month-tasks">
                  {formattedTasks.map((task) => {
                    return isTaskInMonth(month.date, task) ? (
                      <div key={task.id} className="task-indicator task-circle" style={{ backgroundColor: task.color }}></div>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttChart;
