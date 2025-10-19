import React, { useState } from 'react';
import GeneratorBasics from './demos/GeneratorBasics';
import FiberArchitecture from './demos/FiberArchitecture';
import PriorityScheduling from './demos/PriorityScheduling';
import RequestAnimationFrameDemo from './demos/RequestAnimationFrameDemo';
import RequestIdleCallbackDemo from './demos/RequestIdleCallbackDemo';
import './App.css';

type Tab = 'intro' | 'generator' | 'raf' | 'ric' | 'fiber' | 'scheduling';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('intro');

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>⚛️ React Fiber 架构详解</h1>
          <p className="subtitle">深入理解 React 16+ 的协调引擎</p>
        </div>
      </header>

      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'intro' ? 'active' : ''}`}
          onClick={() => setActiveTab('intro')}
        >
          📖 介绍
        </button>
        <button
          className={`tab-button ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
        >
          🎯 Generator 基础
        </button>
        <button
          className={`tab-button ${activeTab === 'raf' ? 'active' : ''}`}
          onClick={() => setActiveTab('raf')}
        >
          🎬 RAF 动画
        </button>
        <button
          className={`tab-button ${activeTab === 'ric' ? 'active' : ''}`}
          onClick={() => setActiveTab('ric')}
        >
          💤 RIC 空闲回调
        </button>
        <button
          className={`tab-button ${activeTab === 'fiber' ? 'active' : ''}`}
          onClick={() => setActiveTab('fiber')}
        >
          🏗️ Fiber 架构
        </button>
        <button
          className={`tab-button ${activeTab === 'scheduling' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduling')}
        >
          🎯 优先级调度
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'intro' && <IntroSection />}
        {activeTab === 'generator' && <GeneratorBasics />}
        {activeTab === 'raf' && <RequestAnimationFrameDemo />}
        {activeTab === 'ric' && <RequestIdleCallbackDemo />}
        {activeTab === 'fiber' && <FiberArchitecture />}
        {activeTab === 'scheduling' && <PriorityScheduling />}
      </main>

      <footer className="app-footer">
        <p>Made with ❤️ to understand React Fiber Architecture</p>
      </footer>
    </div>
  );
}

const IntroSection: React.FC = () => {
  return (
    <div className="intro-section">
      <div className="hero-banner">
        <h2>🚀 什么是 React Fiber？</h2>
        <p className="lead">
          Fiber 是 React 16 引入的新协调引擎（reconciliation engine），
          它重新实现了 React 的核心算法，使得 React 能够：
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⏸️</div>
            <h3>可中断渲染</h3>
            <p>将渲染工作分解成小单元，可以随时暂停和恢复</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>优先级调度</h3>
            <p>为不同类型的更新分配优先级，高优先级任务可以插队</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>时间切片</h3>
            <p>避免长时间阻塞主线程，保持页面流畅响应</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>并发渲染</h3>
            <p>同时准备多个版本的 UI，实现更好的用户体验</p>
          </div>
        </div>
      </div>

      <div className="content-section">
        <h2>📚 为什么需要 Fiber？</h2>
        <div className="problem-solution">
          <div className="problem-box">
            <h3>❌ React 15 的问题</h3>
            <ul>
              <li>递归遍历虚拟 DOM 树，无法中断</li>
              <li>大型组件树渲染会阻塞主线程</li>
              <li>用户交互可能会出现卡顿</li>
              <li>无法区分更新的优先级</li>
              <li>同步渲染模式，all or nothing</li>
            </ul>
          </div>
          <div className="solution-box">
            <h3>✅ Fiber 的解决方案</h3>
            <ul>
              <li>链表结构，支持可中断的遍历</li>
              <li>时间切片，避免长时间占用主线程</li>
              <li>高优先级任务可以快速响应</li>
              <li>基于优先级的调度系统</li>
              <li>支持并发渲染模式</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="content-section">
        <h2>🧬 Fiber 的核心概念</h2>
        <div className="concepts-list">
          <div className="concept-item">
            <h3>1. Fiber 节点</h3>
            <p>
              Fiber 是一个 JavaScript 对象，表示组件、DOM 节点或其他 React 元素。
              每个 Fiber 节点都包含了组件的类型、props、state 等信息。
            </p>
            <pre className="code-example">{`interface Fiber {
  type: any;              // 组件类型
  key: null | string;     // key
  stateNode: any;         // 真实 DOM 节点
  child: Fiber | null;    // 第一个子节点
  sibling: Fiber | null;  // 下一个兄弟节点
  return: Fiber | null;   // 父节点
  alternate: Fiber | null;// 对应的另一棵树的节点
  effectTag: number;      // 副作用标记
  // ...
}`}</pre>
          </div>

          <div className="concept-item">
            <h3>2. 双缓冲技术</h3>
            <p>
              React 维护两棵 Fiber 树：<code>current</code> 树（当前显示的）和 <code>workInProgress</code> 树（正在构建的）。
              完成构建后，两棵树交换指针，实现快速更新。
            </p>
            <pre className="code-example">{`// current 树：当前屏幕显示
const current = root.current;

// workInProgress 树：正在构建
const workInProgress = 
  createWorkInProgress(current);

// 完成后交换
root.current = workInProgress;`}</pre>
          </div>

          <div className="concept-item">
            <h3>3. 两阶段提交</h3>
            <p>
              Fiber 的工作分为两个阶段：<strong>Render 阶段</strong>（可中断）和 <strong>Commit 阶段</strong>（不可中断）。
            </p>
            <div className="phase-comparison">
              <div className="phase">
                <h4>Render 阶段</h4>
                <ul>
                  <li>可以被打断、暂停、恢复</li>
                  <li>调用生命周期：getDerivedStateFromProps、shouldComponentUpdate、render</li>
                  <li>构建 Fiber 树，标记副作用</li>
                  <li>纯计算，没有副作用</li>
                </ul>
              </div>
              <div className="phase">
                <h4>Commit 阶段</h4>
                <ul>
                  <li>不能被打断，同步执行</li>
                  <li>调用生命周期：componentDidMount、componentDidUpdate</li>
                  <li>执行 DOM 操作</li>
                  <li>执行副作用</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="concept-item">
            <h3>4. Generator vs Fiber</h3>
            <p>
              虽然 Fiber 的思想受到 Generator 的启发，但 React 最终没有使用 Generator，
              而是自己实现了一套基于链表的可中断遍历机制。
            </p>
            <div className="comparison-grid">
              <div className="comparison-item">
                <h4>为什么不用 Generator？</h4>
                <ul>
                  <li>Generator 是同步的，不能真正实现并发</li>
                  <li>Generator 函数一旦开始就无法从外部介入</li>
                  <li>无法实现灵活的优先级调度</li>
                  <li>难以实现双缓冲技术</li>
                </ul>
              </div>
              <div className="comparison-item">
                <h4>Fiber 的优势</h4>
                <ul>
                  <li>基于链表，可以随时暂停和恢复</li>
                  <li>可以在任意节点开始或结束工作</li>
                  <li>支持复杂的优先级调度</li>
                  <li>更好的错误处理和调试</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <h2>🎓 学习路径</h2>
        <div className="learning-path">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>理解 Generator 函数</h3>
              <p>学习 Generator 的基本概念和使用方法，理解可中断执行的思想</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>了解 Fiber 架构</h3>
              <p>学习 Fiber 的数据结构、工作原理和核心机制</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>掌握优先级调度</h3>
              <p>理解 React 如何为不同更新分配优先级，实现最佳用户体验</p>
            </div>
          </div>
        </div>
      </div>

      <div className="call-to-action">
        <h2>🚀 开始探索</h2>
        <p>点击上方标签页，深入了解每个主题的详细内容和交互式演示</p>
      </div>
    </div>
  );
};

export default App;
