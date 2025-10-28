import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1 className="demo-title">🔁 JavaScript 事件循环学习平台</h1>
        <p className="demo-subtitle">
          深入理解浏览器事件循环机制，掌握JavaScript异步编程的核心原理
        </p>
      </div>

      <div className="demo-section">
        <h2 className="section-title">📚 学习目标</h2>
        <div className="section-content">
          <p>通过这个交互式学习平台，你将掌握：</p>
          <ul>
            <li><strong>事件循环的基本概念</strong> - 理解JavaScript的单线程执行模型</li>
            <li><strong>宏任务与微任务</strong> - 掌握任务队列的优先级机制</li>
            <li><strong>Promise原理</strong> - 深入理解Promise与事件循环的关系</li>
            <li><strong>Async/Await</strong> - 现代异步编程的最佳实践</li>
            <li><strong>定时器机制</strong> - setTimeout和setInterval的工作原理</li>
            <li><strong>常见面试题</strong> - 实战练习，掌握面试技巧</li>
          </ul>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">🎯 学习路径</h2>
        <div className="section-content">
          <div className="highlight-box">
            <h3 style={{ marginBottom: '16px', color: '#667eea' }}>建议学习顺序</h3>
            <ol style={{ lineHeight: '2' }}>
              <li><strong>事件循环基础</strong> - 从零开始理解执行栈和任务队列</li>
              <li><strong>宏任务 vs 微任务</strong> - 理解不同任务类型的执行顺序</li>
              <li><strong>Promise详解</strong> - 掌握Promise的状态流转</li>
              <li><strong>Async/Await</strong> - 学习异步函数的语法糖</li>
              <li><strong>定时器机制</strong> - 理解延迟任务的调度</li>
              <li><strong>面试题精选</strong> - 综合运用所学知识</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">💡 为什么要学习事件循环？</h2>
        <div className="section-content">
          <div className="info-box">
            <p><strong>理解事件循环是掌握JavaScript的关键：</strong></p>
            <ul>
              <li>✅ 编写高性能的异步代码</li>
              <li>✅ 避免常见的异步编程陷阱</li>
              <li>✅ 理解框架和库的工作原理</li>
              <li>✅ 解决复杂的并发问题</li>
              <li>✅ 通过JavaScript面试</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">🚀 快速开始</h2>
        <div className="section-content">
          <p>
            点击左侧菜单，开始你的学习之旅。每个章节都包含：
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '20px' }}>
            <div className="info-box">
              <strong>📖 理论讲解</strong>
              <p style={{ marginTop: '8px' }}>清晰易懂的概念说明</p>
            </div>
            <div className="info-box success">
              <strong>💻 代码示例</strong>
              <p style={{ marginTop: '8px' }}>可运行的交互式代码</p>
            </div>
            <div className="info-box warning">
              <strong>🎨 可视化演示</strong>
              <p style={{ marginTop: '8px' }}>动态展示执行过程</p>
            </div>
            <div className="info-box error">
              <strong>⚠️ 常见陷阱</strong>
              <p style={{ marginTop: '8px' }}>避免踩坑的注意事项</p>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">📌 核心概念预览</h2>
        <div className="section-content">
          <div className="visualization">
            <h3 style={{ marginBottom: '16px' }}>事件循环执行模型</h3>
            <pre style={{ background: '#f8f9fa', color: '#2c3e50', padding: '20px' }}>
{`┌───────────────────────────┐
│   Call Stack (调用栈)      │  ← 同步代码执行
└───────────────────────────┘
           ↓
┌───────────────────────────┐
│   Microtask Queue          │  ← 微任务队列
│   • Promise.then()         │    (优先级高)
│   • queueMicrotask()       │
│   • MutationObserver       │
└───────────────────────────┘
           ↓
┌───────────────────────────┐
│   Macrotask Queue          │  ← 宏任务队列
│   • setTimeout()           │    (优先级低)
│   • setInterval()          │
│   • setImmediate()         │
│   • I/O                    │
└───────────────────────────┘`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

