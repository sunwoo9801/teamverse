import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaProjectDiagram, FaComments, FaLock } from "react-icons/fa";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col items-center text-white">
      
      {/* Hero Section */}
      <header className="w-full max-w-5xl text-center py-16 px-6">
        <motion.h1 
          className="text-4xl md:text-6xl font-extrabold leading-tight tracking-wide whitespace-nowrap"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          TeamVerse에 오신 것을 환영합니다!
        </motion.h1>
        <motion.p 
          className="mt-4 text-lg md:text-xl opacity-80"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          팀 협업을 더욱 스마트하게! 직관적인 UI와 강력한 기능을 경험하세요.
        </motion.p>
        <motion.div 
          className="mt-6 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link 
            to="/login" 
            className="bg-white text-blue-600 hover:bg-blue-500 hover:text-white transition px-8 py-3 rounded-full text-lg font-semibold shadow-lg transform hover:scale-105"
          >
            지금 시작하기 →
          </Link>
        </motion.div>
      </header>

      {/* Features Section */}
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-12">
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            className="bg-white text-gray-800 p-8 rounded-2xl shadow-xl text-center transform transition hover:scale-105 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <div className="text-5xl text-blue-600 mb-4">
              {feature.icon}
            </div>
            <h2 className="text-2xl font-bold">{feature.title}</h2>
            <p className="mt-3 text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </section>

      {/* Call to Action Section */}
      <motion.section 
        className="w-full max-w-4xl text-center py-12 px-6 bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-md mt-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold mb-4">팀과 함께 성장하세요!</h2>
        <p className="text-lg opacity-90">
          지금 바로 TeamVerse를 시작하고, 효율적인 협업을 경험하세요.
        </p>
        <div className="mt-6">
          <Link 
            to="/signup" 
            className="bg-purple-500 hover:bg-purple-600 text-white transition px-8 py-3 rounded-full text-lg font-semibold shadow-lg transform hover:scale-105"
          >
            무료로 가입하기 →
          </Link>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="w-full text-center py-6 opacity-70 text-sm">
        © 2024 TeamVerse. All Rights Reserved.
      </footer>
    </div>
  );
};

// Feature List
const features = [
  {
    icon: <FaProjectDiagram />,
    title: "프로젝트 관리",
    description: "Gantt 차트, 작업 보드, 일정 관리로 프로젝트를 효율적으로 운영하세요."
  },
  {
    icon: <FaComments />,
    title: "실시간 협업",
    description: "실시간 채팅 및 화상 회의로 팀원들과 원활하게 소통하세요."
  },
  {
    icon: <FaLock />,
    title: "보안 강화",
    description: "최고 수준의 암호화 기술을 적용하여 데이터를 안전하게 보호합니다."
  }
];

export default LandingPage;
