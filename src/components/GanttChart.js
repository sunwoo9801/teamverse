// import React, { useState, useEffect } from 'react';
// import '../styles/GanttChart.css';

// // 파스텔 톤 색상 생성 함수
// const generatePastelColor = () => {
//   const r = Math.floor((Math.random() * 127) + 127); // 127~254
//   const g = Math.floor((Math.random() * 127) + 127); // 127~254
//   const b = Math.floor((Math.random() * 127) + 127); // 127~254
//   return `rgb(${r}, ${g}, ${b})`;
// };

// const GanttChart = ({ project }) => {
//   const initialTasks = [
//     { id: 1, name: 'Design Phase', start: new Date(2025, 1, 5), end: new Date(2025, 1, 8), progress: 100 },
//     { id: 2, name: 'Development Phase', start: new Date(2025, 1, 5), end: new Date(2025, 1, 9), progress: 75 },
//     { id: 3, name: 'Testing Phase', start: new Date(2025, 1, 5), end: new Date(2025, 1, 10), progress: 30 },
//   ];

//   const [tasks, setTasks] = useState([]);
//   const [viewMode, setViewMode] = useState('week'); // 현재 보기 모드 (week, month, year)
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
//   const today = new Date();


//   useEffect(() => {

//     if (!project) {
//       setTasks([]); // ✅ 프로젝트 없을 경우 빈 상태 유지
//       return;
//     }

//     console.log("📌 선택된 프로젝트:", project.name); // ✅ 콘솔에서 프로젝트 이름 확인

//     const savedColors = JSON.parse(localStorage.getItem('taskColors')) || {};
//     const tasksWithColors = initialTasks.map((task) => ({
//       ...task,
//       color: savedColors[task.id] || generatePastelColor(),
//     }));

//     const newColors = tasksWithColors.reduce((acc, task) => {
//       if (!savedColors[task.id]) {
//         acc[task.id] = task.color;
//       }
//       return acc;
//     }, {});
//     localStorage.setItem('taskColors', JSON.stringify({ ...savedColors, ...newColors }));

//     setTasks(tasksWithColors);
//   },[project]);



//   const getWeekDates = () => {
//     const today = new Date();
//     const firstDayOfWeek = today.getDate() - today.getDay();
//     return Array.from({ length: 7 }, (_, i) => {
//       const date = new Date(today.getFullYear(), today.getMonth(), firstDayOfWeek + i);
//       return {
//         day: date.toLocaleDateString('en-US', { weekday: 'short' }),
//         date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
//       };
//     });
//   };

//   const getMonthDates = () => {
//     const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
//     const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
//     const dates = [];

//     // 첫 주 빈 칸
//     for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
//       dates.push(null);
//     }

//     // 해당 월의 모든 날짜
//     for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
//       const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
//       dates.push(date);
//     }

//     return dates;
//   };

//   const handlePreviousMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
//   };

//   const handleNextMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
//   };

//   const getYearMonths = () => {
//     return Array.from({ length: 12 }, (_, index) => {
//       const monthDate = new Date(currentYear, index, 1);
//       return {
//         name: monthDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
//         date: monthDate,
//       };
//     });
//   };

//   const isToday = (date) => {
//     // date가 유효한 경우에만 체크
//     return date && today.getFullYear() === date.getFullYear() &&
//       today.getMonth() === date.getMonth() &&
//       today.getDate() === date.getDate();
//   };

//   const weekDates = getWeekDates();
//   const monthDates = getMonthDates();
//   const yearMonths = getYearMonths();

//   const handlePreviousYear = () => {
//     setCurrentYear((prevYear) => prevYear - 1);
//   };

//   const handleNextYear = () => {
//     setCurrentYear((prevYear) => prevYear + 1);
//   };

//   const isTaskInMonth = (monthDate, task) => {
//     const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
//     const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
//     return task.start <= monthEnd && task.end >= monthStart;
//   };

//   const isTodayInMonth = (monthDate) => {
//     return (
//       today.getFullYear() === monthDate.getFullYear() &&
//       today.getMonth() === monthDate.getMonth()
//     );
//   };

//     const isTaskOnDate = (date, task) => {
//     return date >= task.start && date <= task.end;
//   };

//   const calculateProgressBarStyle = (task) => {
//     const weekStart = weekDates[0].date.getTime();
//     const weekEnd = weekDates[6].date.getTime() + 24 * 60 * 60 * 1000 - 1;

//     const taskStart = Math.max(task.start.getTime(), weekStart);
//     const taskEnd = Math.min(task.end.getTime() + 24 * 60 * 60 * 1000 - 1, weekEnd);

//     if (taskEnd < weekStart || taskStart > weekEnd) {
//       return { display: 'none' };
//     }

//     const totalWeekMs = weekEnd - weekStart + 1;
//     const offset = ((taskStart - weekStart) / totalWeekMs) * 100;
//     const width = ((taskEnd - taskStart) / totalWeekMs) * 100;

//     return {
//       left: `${offset}%`,
//       width: `${width}%`,
//     };
//   };

//   const ProgressBar = ({ task, progressBarStyle }) => {
//     return (
//       <div className="progress-bar" style={progressBarStyle}>
//         <div
//           className="progress"
//           style={{
//             width: `${task.progress}%`,
//             backgroundColor: task.color,
//           }}
//         >
//           <span className="task-name">{task.name}</span>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="gantt-chart">
//             {project ? (
//                 <>
//                     <h2 className="project-title">📌 {project.name}</h2> 
//                     <p>프로젝트 시작일: {project.startDate}</p>
//                 </>
//             ) : (
//                 <p>현재 선택된 프로젝트가 없습니다.</p>
//             )}
//       {viewMode === 'week' && (
//         <>
//           <div className="calendar">
//             {weekDates.map((day, index) => (
//             <div key={index} className={`calendar-day ${isToday(day.date) ? 'today' : ''}`}>
//                 <div className="day-name">{day.day}
//                 <div className="day-date">
//                   {day.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
//                 </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="task-container">
//             {tasks.map((task) => {
//               const progressBarStyle = calculateProgressBarStyle(task);
//               return (
//                 <div key={task.id} className="task">
//                   <ProgressBar task={task} progressBarStyle={progressBarStyle} />
//                 </div>
//               );
//             })}
//           </div>
//         </>
//       )}
//       {viewMode === 'month' && (
//         <div className="month-calendar">
//           <div className="month-header">
//             <button className="month-nav" onClick={handlePreviousMonth}>
//               &lt;
//             </button>
//             <div className="month-title">
//               {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
//             </div>
//             <button className="month-nav" onClick={handleNextMonth}>
//               &gt;
//             </button>
//           </div>
//           <div className="calendar-grid">
//             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
//               <div key={day} className="calendar-day-name">
//                 {day}
//               </div>
//             ))}
//             {monthDates.map((date, index) => (
//               <div key={index} className={`calendar-day ${date && isToday(date) ? 'today' : ''}`}>
//                 {date && (
//                   <>
//                     <div className="day-date">{date.getDate()}</div>
//                     <div className="task-indicator-container">
//                       {tasks.map(
//                         (task) =>
//                           isTaskOnDate(date, task) && (
//                             <div key={task.id} className="task-indicator task-bar" // 막대 모양
//                             style={{ backgroundColor: task.color }}></div>
//                           )
//                       )}
//                     </div>
//                   </>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {viewMode === 'year' && (
//               <div className="year-calendar">
//                 <div className="year-header">
//                   <button className="year-nav" onClick={handlePreviousYear}>
//                     &lt;
//                   </button>
//                   <div className="year-title">{currentYear}</div>
//                   <button className="year-nav" onClick={handleNextYear}>
//                     &gt;
//                   </button>
//                 </div>
//                 <div className="year-grid">
//                   {yearMonths.map((month, index) => (
//                     <div key={index} className="year-month">
//                       <div className={`month-name ${isTodayInMonth(month.date) ? 'today' : ''}`}>
//                         {month.name}
//                       </div>
//                       <div className="month-tasks">
//                         {tasks.map(
//                           (task) =>
//                             isTaskInMonth(month.date, task) && (
//                               <div
//                                 key={task.id}
//                                 className="task-indicator task-circle"
//                                 style={{ backgroundColor: task.color }}
//                               ></div>
//                             )
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//         <div className="view-mode-buttons">
//         <button
//           className={`view-button ${viewMode === 'week' ? 'active' : ''}`}
//           onClick={() => setViewMode('week')}
//         >
//           Week
//         </button>
//         <button
//           className={`view-button ${viewMode === 'month' ? 'active' : ''}`}
//           onClick={() => setViewMode('month')}
//         >
//           Month
//         </button>
//         <button
//           className={`view-button ${viewMode === 'year' ? 'active' : ''}`}
//           onClick={() => setViewMode('year')}
//         >
//           Year
//         </button>
//         </div>
//     </div>
//   );
// };

// export default GanttChart;

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
    start: new Date(task.startDate),
    end: new Date(new Date(task.dueDate).setHours(23, 59, 59, 999)), // ✅ 마감일 23:59:59로 설정
    color: task.color || "#ff99a5", // ✅ 색상이 없을 경우 기본값 지정
    //progress: 50, // ✅ 진행률 기본값 (추후 백엔드에서 가져오도록 수정 가능)
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

  const calculateProgressBarStyle = (task) => {
    // ✅ 1) 이번 주 월요일 00:00:00 ~ 일요일 23:59:59 범위를 구함
    const weekStart = new Date(currentWeekStart);
    weekStart.setHours(0, 0, 0, 0); // 월요일 00:00:00
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999); // 일요일 23:59:59

    // ✅ 2) Task의 시작·종료 시점을 `Date` 객체로 변환
    const taskStart = new Date(task.start);
    const taskEnd = new Date(task.end);
    taskStart.setHours(0, 0, 0, 0);
    taskEnd.setHours(23, 59, 59, 999);

    console.log(`🛠️ Task ${task.name}: Start - ${taskStart}, End - ${taskEnd}`);
    console.log(`📆 Week: Start - ${weekStart}, End - ${weekEnd}`);

    // ✅ 3) 주간 범위 내에 포함되는 경우만 진행 (Task가 범위를 완전히 벗어나면 숨김)
    if (taskEnd < weekStart || taskStart > weekEnd) {
        console.log(`❌ Task ${task.name} is out of range`);
      return { display: 'none' };
    }

    // ✅ 4) Task의 시작·종료 시간을 주간 범위 내로 조정 (Clamping)
    const clampedStart = Math.max(taskStart.getTime(), weekStart.getTime());
    const clampedEnd = Math.min(taskEnd.getTime(), weekEnd.getTime());

    // ✅ 5) 표시할 범위(%) 계산
    const totalWeekMs = weekEnd.getTime() - weekStart.getTime();
    const offset = ((clampedStart - weekStart.getTime()) / totalWeekMs) * 100;
    const width = ((clampedEnd - clampedStart) / totalWeekMs) * 100;

    return {
      left: `${offset}%`,
      width: `${width}%`,
      backgroundColor: task.color || "#4caf50",
    };
  };


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
          </div>

          <div className="task-container">
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
          </div>
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
