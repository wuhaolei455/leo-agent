import React, { useState, useRef, useEffect } from 'react';
import './RequestAnimationFrameDemo.css';

/**
 * requestAnimationFrame API 演示
 * 展示浏览器帧动画 API，这是 React Fiber 实现时间切片的基础
 */

const RequestAnimationFrameDemo: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [intervals, setIntervals] = useState<number[]>([]);
  const [avgFrameTime, setAvgFrameTime] = useState(0);
  const [fps, setFps] = useState(0);
  
  const animationIdRef = useRef<number | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  // 基础进度条动画
  const startBasicAnimation = () => {
    if (!divRef.current) return;
    
    setProgress(0);
    setIntervals([]);
    setIsAnimating(true);
    
    let start = Date.now();
    let width = 0;
    const allIntervals: number[] = [];

    const animate = () => {
      width += 1;
      setProgress(width);
      
      if (width < 100) {
        const current = Date.now();
        const interval = current - start;
        allIntervals.push(interval);
        start = current;
        
        animationIdRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setIntervals(allIntervals);
        
        // 计算平均帧时间和 FPS
        const avg = allIntervals.reduce((a, b) => a + b, 0) / allIntervals.length;
        setAvgFrameTime(avg);
        setFps(Math.round(1000 / avg));
      }
    };

    animationIdRef.current = requestAnimationFrame(animate);
  };

  // 对比：使用 setTimeout（不流畅）
  const [setTimeoutProgress, setSetTimeoutProgress] = useState(0);
  const [isSetTimeoutAnimating, setIsSetTimeoutAnimating] = useState(false);
  const timeoutIdRef = useRef<number | null>(null);

  const startSetTimeoutAnimation = () => {
    setSetTimeoutProgress(0);
    setIsSetTimeoutAnimating(true);
    
    let width = 0;
    
    const animate = () => {
      width += 1;
      setSetTimeoutProgress(width);
      
      if (width < 100) {
        timeoutIdRef.current = window.setTimeout(animate, 16);
      } else {
        setIsSetTimeoutAnimating(false);
      }
    };
    
    animate();
  };

  // 可中断的动画（模拟 Fiber）
  const [interruptibleProgress, setInterruptibleProgress] = useState(0);
  const [isInterruptibleAnimating, setIsInterruptibleAnimating] = useState(false);
  const [workLog, setWorkLog] = useState<string[]>([]);
  const interruptibleIdRef = useRef<number | null>(null);

  const startInterruptibleAnimation = () => {
    setInterruptibleProgress(0);
    setIsInterruptibleAnimating(true);
    setWorkLog([]);
    
    let width = 0;
    const log: string[] = [];
    
    const animate = (timestamp: number) => {
      const frameDeadline = timestamp + 16; // 每帧 16ms
      let workDone = 0;
      
      // 在时间片内尽可能多做工作
      while (performance.now() < frameDeadline && width < 100) {
        width += 1;
        workDone++;
      }
      
      setInterruptibleProgress(width);
      log.push(`帧 ${log.length + 1}: 完成 ${workDone} 个单位的工作, 当前进度 ${width}%`);
      setWorkLog([...log]);
      
      if (width < 100) {
        interruptibleIdRef.current = requestAnimationFrame(animate);
      } else {
        setIsInterruptibleAnimating(false);
      }
    };
    
    interruptibleIdRef.current = requestAnimationFrame(animate);
  };

  // 多任务并发动画
  const [task1Progress, setTask1Progress] = useState(0);
  const [task2Progress, setTask2Progress] = useState(0);
  const [task3Progress, setTask3Progress] = useState(0);
  const [isConcurrentAnimating, setIsConcurrentAnimating] = useState(false);
  const concurrentIdRef = useRef<number | null>(null);

  const startConcurrentAnimation = () => {
    setTask1Progress(0);
    setTask2Progress(0);
    setTask3Progress(0);
    setIsConcurrentAnimating(true);
    
    let t1 = 0, t2 = 0, t3 = 0;
    
    const animate = () => {
      // 模拟不同速度的任务
      if (t1 < 100) t1 += 0.5;
      if (t2 < 100) t2 += 1;
      if (t3 < 100) t3 += 1.5;
      
      setTask1Progress(Math.min(t1, 100));
      setTask2Progress(Math.min(t2, 100));
      setTask3Progress(Math.min(t3, 100));
      
      if (t1 < 100 || t2 < 100 || t3 < 100) {
        concurrentIdRef.current = requestAnimationFrame(animate);
      } else {
        setIsConcurrentAnimating(false);
      }
    };
    
    concurrentIdRef.current = requestAnimationFrame(animate);
  };

  // 清理函数
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (interruptibleIdRef.current) {
        cancelAnimationFrame(interruptibleIdRef.current);
      }
      if (concurrentIdRef.current) {
        cancelAnimationFrame(concurrentIdRef.current);
      }
    };
  }, []);

  return (
    <div className="raf-demo">
      <h2>🎬 requestAnimationFrame API 详解</h2>
      <p className="description">
        requestAnimationFrame (RAF) 是浏览器提供的动画 API，
        它会在下一次重绘之前调用指定的回调函数。
        这是实现流畅动画和 React Fiber 时间切片的基础。
      </p>

      <div className="demo-section">
        <h3>1. 基础动画演示</h3>
        <p>使用 requestAnimationFrame 实现流畅的进度条动画</p>
        
        <div className="animation-container">
          <div 
            ref={divRef}
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          >
            {progress}%
          </div>
        </div>
        
        <button 
          onClick={startBasicAnimation}
          disabled={isAnimating}
          className="start-btn"
        >
          {isAnimating ? '动画进行中...' : '开始动画'}
        </button>

        {intervals.length > 0 && (
          <div className="stats">
            <h4>性能统计</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">总帧数:</span>
                <span className="stat-value">{intervals.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">平均帧时间:</span>
                <span className="stat-value">{avgFrameTime.toFixed(2)} ms</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">平均 FPS:</span>
                <span className="stat-value">{fps}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">最小间隔:</span>
                <span className="stat-value">{Math.min(...intervals).toFixed(2)} ms</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">最大间隔:</span>
                <span className="stat-value">{Math.max(...intervals).toFixed(2)} ms</span>
              </div>
            </div>
          </div>
        )}

        <div className="code-block">
          <h4>代码示例</h4>
          <pre>{`const animate = () => {
  // 更新动画状态
  width += 1;
  setProgress(width);
  
  if (width < 100) {
    // 请求下一帧
    requestAnimationFrame(animate);
  }
};

// 启动动画
requestAnimationFrame(animate);`}</pre>
        </div>
      </div>

      <div className="demo-section">
        <h3>2. RAF vs setTimeout 对比</h3>
        <p>对比 requestAnimationFrame 和 setTimeout 的性能差异</p>
        
        <div className="comparison-container">
          <div className="comparison-item">
            <h4>✅ requestAnimationFrame (流畅)</h4>
            <div className="animation-container">
              <div 
                className="progress-bar raf"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
            <button onClick={startBasicAnimation} disabled={isAnimating}>
              开始 RAF 动画
            </button>
          </div>

          <div className="comparison-item">
            <h4>❌ setTimeout (可能卡顿)</h4>
            <div className="animation-container">
              <div 
                className="progress-bar settimeout"
                style={{ width: `${setTimeoutProgress}%` }}
              >
                {setTimeoutProgress}%
              </div>
            </div>
            <button onClick={startSetTimeoutAnimation} disabled={isSetTimeoutAnimating}>
              开始 setTimeout 动画
            </button>
          </div>
        </div>

        <div className="info-box">
          <h4>为什么 RAF 更好？</h4>
          <ul>
            <li><strong>与屏幕刷新率同步</strong>: RAF 会在浏览器重绘前执行，通常是 60fps</li>
            <li><strong>自动节流</strong>: 当页面不可见时，RAF 会暂停，节省 CPU</li>
            <li><strong>避免丢帧</strong>: 浏览器会优化 RAF 的调度，减少掉帧</li>
            <li><strong>高精度时间戳</strong>: RAF 的回调会接收一个高精度时间戳参数</li>
          </ul>
        </div>
      </div>

      <div className="demo-section">
        <h3>3. 时间切片 (Time Slicing)</h3>
        <p>模拟 React Fiber 的时间切片机制：每帧做有限的工作</p>
        
        <div className="animation-container">
          <div 
            className="progress-bar interruptible"
            style={{ width: `${interruptibleProgress}%` }}
          >
            {interruptibleProgress}%
          </div>
        </div>
        
        <button 
          onClick={startInterruptibleAnimation}
          disabled={isInterruptibleAnimating}
          className="start-btn"
        >
          {isInterruptibleAnimating ? '执行中...' : '开始时间切片动画'}
        </button>

        <div className="work-log">
          <h4>工作日志 (每帧的工作量)</h4>
          <div className="log-container">
            {workLog.map((log, index) => (
              <div key={index} className="log-entry">
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="code-block">
          <h4>时间切片实现</h4>
          <pre>{`const animate = (timestamp) => {
  // 计算当前帧的截止时间
  const frameDeadline = timestamp + 16; // 约 60fps
  
  // 在时间片内尽可能多做工作
  while (performance.now() < frameDeadline && hasWork) {
    doUnitOfWork(); // 执行一个工作单元
  }
  
  // 如果还有工作，请求下一帧继续
  if (hasWork) {
    requestAnimationFrame(animate);
  }
};`}</pre>
        </div>
      </div>

      <div className="demo-section">
        <h3>4. 多任务并发动画</h3>
        <p>模拟多个任务在同一帧内并发执行</p>
        
        <div className="concurrent-container">
          <div className="task-item">
            <span className="task-label">慢速任务 (0.5/帧)</span>
            <div className="animation-container">
              <div 
                className="progress-bar task1"
                style={{ width: `${task1Progress}%` }}
              >
                {Math.round(task1Progress)}%
              </div>
            </div>
          </div>

          <div className="task-item">
            <span className="task-label">中速任务 (1.0/帧)</span>
            <div className="animation-container">
              <div 
                className="progress-bar task2"
                style={{ width: `${task2Progress}%` }}
              >
                {Math.round(task2Progress)}%
              </div>
            </div>
          </div>

          <div className="task-item">
            <span className="task-label">快速任务 (1.5/帧)</span>
            <div className="animation-container">
              <div 
                className="progress-bar task3"
                style={{ width: `${task3Progress}%` }}
              >
                {Math.round(task3Progress)}%
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={startConcurrentAnimation}
          disabled={isConcurrentAnimating}
          className="start-btn"
        >
          {isConcurrentAnimating ? '执行中...' : '开始并发动画'}
        </button>
      </div>

      <div className="demo-section api-reference">
        <h3>📖 API 参考</h3>
        
        <div className="api-grid">
          <div className="api-card">
            <h4>requestAnimationFrame(callback)</h4>
            <p className="api-description">
              告诉浏览器在下次重绘之前执行指定的回调函数
            </p>
            <pre className="api-signature">{`// 返回一个请求 ID
const id = requestAnimationFrame((timestamp) => {
  // timestamp: DOMHighResTimeStamp
  // 动画代码
});`}</pre>
            <div className="api-details">
              <p><strong>参数</strong>: 回调函数，接收一个高精度时间戳</p>
              <p><strong>返回值</strong>: 请求 ID，可用于取消</p>
              <p><strong>调用时机</strong>: 下次重绘之前</p>
            </div>
          </div>

          <div className="api-card">
            <h4>cancelAnimationFrame(id)</h4>
            <p className="api-description">
              取消之前请求的动画帧回调
            </p>
            <pre className="api-signature">{`const id = requestAnimationFrame(animate);

// 取消动画
cancelAnimationFrame(id);`}</pre>
            <div className="api-details">
              <p><strong>参数</strong>: requestAnimationFrame 返回的 ID</p>
              <p><strong>用途</strong>: 停止动画，避免内存泄漏</p>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>🔗 与 React Fiber 的关系</h3>
        
        <div className="relationship-grid">
          <div className="relationship-card">
            <h4>1. 时间切片基础</h4>
            <p>
              Fiber 使用 RAF 实现时间切片，在每一帧中执行一部分渲染工作，
              确保不会阻塞主线程超过 16ms。
            </p>
          </div>

          <div className="relationship-card">
            <h4>2. 工作循环调度</h4>
            <p>
              Fiber 的 workLoop 在每次 RAF 回调中执行，
              检查时间预算，决定是继续工作还是让出控制权。
            </p>
          </div>

          <div className="relationship-card">
            <h4>3. 可中断渲染</h4>
            <p>
              通过 RAF 和时间切片，Fiber 可以在渲染过程中暂停，
              让浏览器有机会处理用户输入等高优先级任务。
            </p>
          </div>

          <div className="relationship-card">
            <h4>4. 流畅的用户体验</h4>
            <p>
              利用 RAF 的特性，Fiber 可以确保动画流畅、
              交互响应及时，避免页面卡顿。
            </p>
          </div>
        </div>
      </div>

      <div className="summary">
        <h3>💡 总结</h3>
        <ul>
          <li><strong>requestAnimationFrame</strong> 是实现流畅动画的最佳方式</li>
          <li>它与浏览器的重绘周期同步，通常是 <strong>60fps (16.67ms/帧)</strong></li>
          <li>React Fiber 使用 RAF 实现<strong>时间切片</strong>，避免长时间阻塞</li>
          <li>每帧预算约 <strong>5ms</strong> 用于 JS 执行，剩余时间留给浏览器</li>
          <li>通过 RAF 实现的可中断渲染是 Fiber 架构的核心</li>
        </ul>
      </div>
    </div>
  );
};

export default RequestAnimationFrameDemo;

