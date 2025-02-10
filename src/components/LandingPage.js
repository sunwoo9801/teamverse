import React from "react";
import { Link } from "react-router-dom";
import "../styles/MainPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="hero">
        <h1>TeamVerse에 오신 것을 환영합니다!</h1>
        <p>효율적인 팀 협업을 위한 강력한 도구를 제공합니다.</p>
        <Link to="/login" className="btn-primary">시작하기</Link>
      </header>
      <section className="features">
        <div className="feature">
          <h2>간편한 프로젝트 관리</h2>
          <p>Gantt 차트, 작업 보드로 팀과의 협업을 강화하세요.</p>
        </div>
        <div className="feature">
          <h2>실시간 채팅</h2>
          <p>팀원과 실시간으로 소통하며 협업을 개선하세요.</p>
        </div>
        <div className="feature">
          <h2>강력한 보안</h2>
          <p>안전한 로그인 및 데이터 보호를 위한 보안 시스템 적용.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
