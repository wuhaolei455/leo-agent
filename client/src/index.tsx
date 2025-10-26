import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 修复iOS Safari的100vh问题，防止软键盘弹出时闪黑
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// 初始化
setVH();

// 监听resize事件，但使用防抖来避免频繁触发
let resizeTimer: NodeJS.Timeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    setVH();
  }, 100);
});

// 监听orientationchange事件
window.addEventListener('orientationchange', () => {
  setTimeout(setVH, 100);
});

// 监听visualViewport变化（更精确地处理软键盘）
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', setVH);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
