import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import EventLoopBasics from './demos/EventLoopBasics';
import MacroVsMicro from './demos/MacroVsMicro';
import PromiseDemo from './demos/PromiseDemo';
import AsyncAwaitDemo from './demos/AsyncAwaitDemo';
import TimerDemo from './demos/TimerDemo';
import InterviewQuestions from './demos/InterviewQuestions';
import Home from './demos/Home';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/basics" element={<EventLoopBasics />} />
            <Route path="/macro-micro" element={<MacroVsMicro />} />
            <Route path="/promise" element={<PromiseDemo />} />
            <Route path="/async-await" element={<AsyncAwaitDemo />} />
            <Route path="/timer" element={<TimerDemo />} />
            <Route path="/interview" element={<InterviewQuestions />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', label: '🏠 首页', icon: '📖' },
    { path: '/basics', label: '事件循环基础', icon: '🔄' },
    { path: '/macro-micro', label: '宏任务 vs 微任务', icon: '⚖️' },
    { path: '/promise', label: 'Promise详解', icon: '🎯' },
    { path: '/async-await', label: 'Async/Await', icon: '⏳' },
    { path: '/timer', label: '定时器机制', icon: '⏰' },
    { path: '/interview', label: '面试题精选', icon: '💡' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>🔁 事件循环</h1>
        <p>JavaScript异步编程深度解析</p>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p>💻 交互式学习平台</p>
      </div>
    </aside>
  );
}

export default App;

