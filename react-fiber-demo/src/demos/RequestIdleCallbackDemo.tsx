import React, { useState, useRef } from 'react';
import './RequestIdleCallbackDemo.css';

/**
 * requestIdleCallback API 演示
 * 展示浏览器空闲时间调度 API，这是 React Fiber 调度器的重要灵感来源
 */

interface TaskInfo {
  id: number;
  name: string;
  duration: number;
  priority: 'high' | 'normal' | 'low';
  status: 'pending' | 'running' | 'completed';
  startTime?: number;
  endTime?: number;
  idleTime?: number;
}

const RequestIdleCallbackDemo: React.FC = () => {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const taskIdCounter = useRef(1);

  // 添加日志
  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // 演示1: 基础用法
  const [basicProgress, setBasicProgress] = useState(0);
  const [isBasicRunning, setIsBasicRunning] = useState(false);

  const runBasicDemo = () => {
    setBasicProgress(0);
    setIsBasicRunning(true);
    addLog('开始基础演示');

    let count = 0;

    const workLoop = (deadline: IdleDeadline) => {
      addLog(`空闲时间剩余: ${deadline.timeRemaining().toFixed(2)}ms, 是否超时: ${deadline.didTimeout}`);

      // 在空闲时间内执行工作
      while (deadline.timeRemaining() > 0 && count < 100) {
        // do work，when idle
        count++;
        setBasicProgress(count);
      }

      if (count < 100) {
        // 还有工作，继续请求空闲回调
        requestIdleCallback(workLoop);
      } else {
        setIsBasicRunning(false);
        addLog('基础演示完成');
      }
    };

    requestIdleCallback(workLoop);
  };

  // 演示2: 带超时的任务
  const [timeoutProgress, setTimeoutProgress] = useState(0);
  const [isTimeoutRunning, setIsTimeoutRunning] = useState(false);

  const runTimeoutDemo = () => {
    setTimeoutProgress(0);
    setIsTimeoutRunning(true);
    addLog('开始超时演示（2秒超时）');

    let count = 0;
    const startTime = Date.now();

    const workLoop = (deadline: IdleDeadline) => {
      const elapsed = Date.now() - startTime;
      addLog(`已过时间: ${elapsed}ms, 超时: ${deadline.didTimeout}, 剩余: ${deadline.timeRemaining().toFixed(2)}ms`);

      // 执行工作
      while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && count < 100) {
        count++;
        setTimeoutProgress(count);
        
        // 模拟一些工作
        if (deadline.didTimeout) {
          addLog('任务超时，强制执行');
          break; // 超时时只做一点工作
        }
      }

      if (count < 100) {
        requestIdleCallback(workLoop, { timeout: 2000 });
      } else {
        setIsTimeoutRunning(false);
        addLog('超时演示完成');
      }
    };

    requestIdleCallback(workLoop, { timeout: 2000 });
  };

  // 演示3: 任务队列调度
  const runTaskQueueDemo = () => {
    const newTasks: TaskInfo[] = [
      { id: taskIdCounter.current++, name: '数据分析', duration: 50, priority: 'low', status: 'pending' },
      { id: taskIdCounter.current++, name: '日志上报', duration: 30, priority: 'low', status: 'pending' },
      { id: taskIdCounter.current++, name: '缓存更新', duration: 40, priority: 'normal', status: 'pending' },
      { id: taskIdCounter.current++, name: '预加载资源', duration: 60, priority: 'low', status: 'pending' },
    ];

    setTasks(newTasks);
    addLog('添加4个低优先级任务到队列');

    const taskQueue = [...newTasks];

    const processTask = (deadline: IdleDeadline) => {
      addLog(`处理任务，剩余空闲时间: ${deadline.timeRemaining().toFixed(2)}ms`);

      // 处理尽可能多的任务
      while (deadline.timeRemaining() > 0 && taskQueue.length > 0) {
        const task = taskQueue.shift()!;
        
        task.status = 'running';
        task.startTime = Date.now();
        task.idleTime = deadline.timeRemaining();
        setTasks([...taskQueue]);
        addLog(`开始执行: ${task.name}`);

        // 模拟任务执行
        const startTime = performance.now();
        while (performance.now() - startTime < task.duration) {
          // 模拟工作
        }

        task.status = 'completed';
        task.endTime = Date.now();
        setTasks(prev => prev.map(t => t.id === task.id ? task : t));
        addLog(`完成: ${task.name} (耗时 ${task.duration}ms)`);
      }

      // 如果还有任务，继续调度
      if (taskQueue.length > 0) {
        requestIdleCallback(processTask);
      } else {
        addLog('所有任务处理完成');
      }
    };

    requestIdleCallback(processTask);
  };

  // 演示4: 与 RAF 对比
  const [rafProgress, setRafProgress] = useState(0);
  const [ricProgress, setRicProgress] = useState(0);
  const [isComparing, setIsComparing] = useState(false);

  const runComparisonDemo = () => {
    setRafProgress(0);
    setRicProgress(0);
    setIsComparing(true);
    addLog('开始对比 RAF vs RIC');

    // RAF 动画 - 每帧执行
    let rafCount = 0;
    const rafAnimate = () => {
      rafCount += 2; // 快速增长
      setRafProgress(Math.min(rafCount, 100));
      
      if (rafCount < 100) {
        requestAnimationFrame(rafAnimate);
      }
    };
    requestAnimationFrame(rafAnimate);

    // RIC 动画 - 空闲时执行
    let ricCount = 0;
    const ricAnimate = (deadline: IdleDeadline) => {
      while (deadline.timeRemaining() > 0 && ricCount < 100) {
        ricCount += 1; // 慢速增长
        setRicProgress(ricCount);
      }
      
      if (ricCount < 100) {
        requestIdleCallback(ricAnimate);
      } else {
        setIsComparing(false);
        addLog('对比演示完成');
      }
    };
    requestIdleCallback(ricAnimate);
  };

  // 演示5: 模拟繁忙场景
  const [isBusy, setIsBusy] = useState(false);
  const [idleProgress, setIdleProgress] = useState(0);

  const simulateBusyScenario = () => {
    setIdleProgress(0);
    setIsBusy(true);
    addLog('开始模拟繁忙场景（密集动画）');

    // 创建密集的 RAF 动画模拟繁忙
    let animationCount = 0;
    const busyAnimation = () => {
      // 模拟繁重计算
      const start = performance.now();
      while (performance.now() - start < 10) {
        // 消耗 CPU
        Math.random();
      }
      
      animationCount++;
      if (animationCount < 300) { // 运行5秒
        requestAnimationFrame(busyAnimation);
      } else {
        setIsBusy(false);
        addLog('繁忙场景结束');
      }
    };
    requestAnimationFrame(busyAnimation);

    // 同时尝试在空闲时更新进度
    let idleCount = 0;
    const idleWork = (deadline: IdleDeadline) => {
      if (deadline.timeRemaining() > 0) {
        idleCount += 5;
        setIdleProgress(Math.min(idleCount, 100));
        addLog(`空闲时执行，剩余 ${deadline.timeRemaining().toFixed(2)}ms`);
      }
      
      if (idleCount < 100) {
        requestIdleCallback(idleWork);
      }
    };
    requestIdleCallback(idleWork);
  };

  // 清空日志
  const clearLog = () => {
    setLog([]);
  };

  return (
    <div className="ric-demo">
      <h2>💤 requestIdleCallback API 详解</h2>
      <p className="description">
        requestIdleCallback (RIC) 允许开发者在浏览器空闲时执行低优先级任务。
        它是 React Fiber 调度系统的重要灵感来源，虽然 React 最终实现了自己的 Scheduler。
      </p>

      <div className="demo-section">
        <h3>1. 基础用法</h3>
        <p>在浏览器空闲时执行任务，不会阻塞高优先级工作（如动画、用户输入）</p>

        <div className="animation-container">
          <div className="progress-bar" style={{ width: `${basicProgress}%` }}>
            {basicProgress}%
          </div>
        </div>

        <button onClick={runBasicDemo} disabled={isBasicRunning} className="start-btn">
          {isBasicRunning ? '执行中...' : '开始基础演示'}
        </button>

        <div className="code-block">
          <h4>代码示例</h4>
          <pre>{`requestIdleCallback((deadline) => {
  // deadline.timeRemaining() 返回当前空闲时间
  // deadline.didTimeout 表示是否超时
  
  while (deadline.timeRemaining() > 0 && hasWork) {
    doWork(); // 执行工作
  }
  
  if (hasWork) {
    requestIdleCallback(workLoop);
  }
});`}</pre>
        </div>
      </div>

      <div className="demo-section">
        <h3>2. 超时机制</h3>
        <p>可以设置超时时间，确保任务不会无限期等待</p>

        <div className="animation-container">
          <div className="progress-bar timeout" style={{ width: `${timeoutProgress}%` }}>
            {timeoutProgress}%
          </div>
        </div>

        <button onClick={runTimeoutDemo} disabled={isTimeoutRunning} className="start-btn">
          {isTimeoutRunning ? '执行中...' : '开始超时演示 (2s)'}
        </button>

        <div className="info-box">
          <h4>超时参数的作用</h4>
          <ul>
            <li>设置 <code>timeout</code> 后，如果任务一直没机会执行，超时后会强制执行</li>
            <li><code>deadline.didTimeout</code> 为 true 表示任务已超时</li>
            <li>超时的任务应该快速执行，避免影响用户体验</li>
            <li>适合有时间要求但不紧急的任务</li>
          </ul>
        </div>

        <div className="code-block">
          <pre>{`// 设置 2 秒超时
requestIdleCallback((deadline) => {
  if (deadline.didTimeout) {
    // 超时了，快速处理关键部分
    doUrgentWork();
  } else {
    // 正常空闲时间，可以做更多工作
    while (deadline.timeRemaining() > 0) {
      doWork();
    }
  }
}, { timeout: 2000 });`}</pre>
        </div>
      </div>

      <div className="demo-section">
        <h3>3. 任务队列调度</h3>
        <p>将多个低优先级任务放入队列，在空闲时逐个处理</p>

        <button onClick={runTaskQueueDemo} className="start-btn">
          运行任务队列演示
        </button>

        <div className="task-list">
          {tasks.map(task => (
            <div key={task.id} className={`task-item ${task.status}`}>
              <span className="task-name">{task.name}</span>
              <span className="task-duration">{task.duration}ms</span>
              <span className="task-priority">{task.priority}</span>
              <span className={`task-status ${task.status}`}>
                {task.status === 'pending' && '⏳ 等待'}
                {task.status === 'running' && '⚡ 执行中'}
                {task.status === 'completed' && '✅ 完成'}
              </span>
            </div>
          ))}
        </div>

        <div className="code-block">
          <h4>任务队列实现</h4>
          <pre>{`const taskQueue = [task1, task2, task3];

const processQueue = (deadline) => {
  // 尽可能多处理任务
  while (deadline.timeRemaining() > 0 && taskQueue.length > 0) {
    const task = taskQueue.shift();
    executeTask(task);
  }
  
  // 还有任务，继续
  if (taskQueue.length > 0) {
    requestIdleCallback(processQueue);
  }
};

requestIdleCallback(processQueue);`}</pre>
        </div>
      </div>

      <div className="demo-section">
        <h3>4. RAF vs RIC 对比</h3>
        <p>直观对比两个 API 的执行时机和速度差异</p>

        <div className="comparison-container">
          <div className="comparison-item">
            <h4>⚡ requestAnimationFrame</h4>
            <p>每帧执行，优先级高，速度快</p>
            <div className="animation-container">
              <div className="progress-bar raf" style={{ width: `${rafProgress}%` }}>
                {rafProgress}%
              </div>
            </div>
          </div>

          <div className="comparison-item">
            <h4>💤 requestIdleCallback</h4>
            <p>空闲时执行，优先级低，速度慢</p>
            <div className="animation-container">
              <div className="progress-bar ric" style={{ width: `${ricProgress}%` }}>
                {ricProgress}%
              </div>
            </div>
          </div>
        </div>

        <button onClick={runComparisonDemo} disabled={isComparing} className="start-btn">
          开始对比
        </button>

        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>特性</th>
                <th>requestAnimationFrame</th>
                <th>requestIdleCallback</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>执行时机</td>
                <td>每帧开始前</td>
                <td>帧结束后的空闲时间</td>
              </tr>
              <tr>
                <td>优先级</td>
                <td>高（渲染相关）</td>
                <td>低（非关键任务）</td>
              </tr>
              <tr>
                <td>调用频率</td>
                <td>~60 次/秒</td>
                <td>不固定，取决于空闲时间</td>
              </tr>
              <tr>
                <td>适用场景</td>
                <td>动画、视觉更新</td>
                <td>分析、日志、预加载</td>
              </tr>
              <tr>
                <td>是否阻塞渲染</td>
                <td>可能阻塞</td>
                <td>不阻塞</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="demo-section">
        <h3>5. 繁忙场景测试</h3>
        <p>在页面繁忙时（密集动画），观察空闲回调的执行情况</p>

        <div className="animation-container">
          <div className="progress-bar busy" style={{ width: `${idleProgress}%` }}>
            空闲任务进度: {idleProgress}%
          </div>
        </div>

        <button onClick={simulateBusyScenario} disabled={isBusy} className="start-btn">
          {isBusy ? '场景运行中...' : '模拟繁忙场景'}
        </button>

        <div className="warning-box">
          <h4>⚠️ 观察要点</h4>
          <p>
            当页面执行密集动画时，空闲时间会变少，RIC 回调执行频率降低。
            这正是 RIC 的设计目标：<strong>不影响关键任务的执行</strong>。
          </p>
        </div>
      </div>

      <div className="demo-section api-reference">
        <h3>📖 API 参考</h3>

        <div className="api-grid">
          <div className="api-card">
            <h4>requestIdleCallback(callback, options?)</h4>
            <pre className="api-signature">{`const handle = requestIdleCallback(
  (deadline: IdleDeadline) => {
    // 工作代码
  },
  { timeout: 1000 } // 可选
);`}</pre>
            <div className="api-details">
              <p><strong>参数</strong>:</p>
              <ul>
                <li><code>callback</code>: 空闲时执行的函数</li>
                <li><code>options.timeout</code>: 超时时间（毫秒）</li>
              </ul>
              <p><strong>返回值</strong>: 句柄 ID，用于取消</p>
            </div>
          </div>

          <div className="api-card">
            <h4>IdleDeadline 接口</h4>
            <pre className="api-signature">{`interface IdleDeadline {
  timeRemaining(): number;
  readonly didTimeout: boolean;
}`}</pre>
            <div className="api-details">
              <p><strong>属性和方法</strong>:</p>
              <ul>
                <li><code>timeRemaining()</code>: 返回剩余空闲时间（ms）</li>
                <li><code>didTimeout</code>: 是否因超时而执行</li>
              </ul>
            </div>
          </div>

          <div className="api-card">
            <h4>cancelIdleCallback(handle)</h4>
            <pre className="api-signature">{`const handle = requestIdleCallback(work);

// 取消回调
cancelIdleCallback(handle);`}</pre>
            <div className="api-details">
              <p><strong>参数</strong>: requestIdleCallback 返回的句柄</p>
              <p><strong>用途</strong>: 取消尚未执行的空闲回调</p>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>🔗 与 React Fiber 的关系</h3>

        <div className="relationship-grid">
          <div className="relationship-card">
            <h4>1. 灵感来源</h4>
            <p>
              React Fiber 的调度思想受到 RIC 启发，但没有直接使用它。
              因为 RIC 的调度粒度太粗，且浏览器支持不完善。
            </p>
          </div>

          <div className="relationship-card">
            <h4>2. 自定义调度器</h4>
            <p>
              React 实现了自己的 Scheduler 包，模拟了 RIC 的功能，
              但有更精细的控制和更好的跨浏览器支持。
            </p>
          </div>

          <div className="relationship-card">
            <h4>3. 优先级系统</h4>
            <p>
              RIC 只有"空闲"和"超时"两种状态，而 Fiber 有 5 个优先级等级，
              可以更灵活地调度不同类型的更新。
            </p>
          </div>

          <div className="relationship-card">
            <h4>4. 时间切片结合</h4>
            <p>
              Fiber 结合了 RAF（帧内工作）和 RIC（空闲工作）的思想，
              实现了完整的任务调度系统。
            </p>
          </div>
        </div>

        <div className="code-block">
          <h4>React Scheduler 简化实现</h4>
          <pre>{`// React 的 Scheduler 包模拟了类似功能
import { unstable_scheduleCallback, unstable_IdlePriority } from 'scheduler';

// 调度一个空闲优先级任务
unstable_scheduleCallback(unstable_IdlePriority, () => {
  // 在空闲时执行的工作
  doBackgroundWork();
});`}</pre>
        </div>
      </div>

      <div className="demo-section">
        <h3>💡 使用场景</h3>

        <div className="use-case-grid">
          <div className="use-case-card">
            <h4>✅ 适合的场景</h4>
            <ul>
              <li>数据分析和统计上报</li>
              <li>非关键资源的预加载</li>
              <li>日志记录和调试信息</li>
              <li>缓存更新和清理</li>
              <li>离线数据同步</li>
              <li>大数据集的后台处理</li>
            </ul>
          </div>

          <div className="use-case-card">
            <h4>❌ 不适合的场景</h4>
            <ul>
              <li>动画和视觉更新（用 RAF）</li>
              <li>用户输入响应（立即执行）</li>
              <li>关键数据获取（优先级高）</li>
              <li>DOM 更新（可能导致布局抖动）</li>
              <li>时间敏感的操作</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>🎓 最佳实践</h3>

        <div className="best-practice-list">
          <div className="practice-item">
            <h4>1. 检查剩余时间</h4>
            <pre>{`requestIdleCallback((deadline) => {
  // 始终检查剩余时间
  while (deadline.timeRemaining() > 1 && hasWork) {
    doWork();
  }
});`}</pre>
          </div>

          <div className="practice-item">
            <h4>2. 拆分大任务</h4>
            <pre>{`const bigTask = [/* 大量工作 */];
let index = 0;

const workLoop = (deadline) => {
  while (deadline.timeRemaining() > 0 && index < bigTask.length) {
    processSingleItem(bigTask[index++]);
  }
  
  if (index < bigTask.length) {
    requestIdleCallback(workLoop);
  }
};`}</pre>
          </div>

          <div className="practice-item">
            <h4>3. 合理使用超时</h4>
            <pre>{`// 重要但不紧急的任务设置超时
requestIdleCallback(importantWork, {
  timeout: 3000 // 最多等待 3 秒
});

// 完全不重要的任务不设超时
requestIdleCallback(trivialWork);`}</pre>
          </div>

          <div className="practice-item">
            <h4>4. 避免 DOM 操作</h4>
            <pre>{`// ❌ 不好：在空闲回调中修改 DOM
requestIdleCallback(() => {
  element.style.color = 'red'; // 可能导致意外的重排
});

// ✅ 好：只做计算，DOM 更新用 RAF
requestIdleCallback(() => {
  const result = heavyCalculation();
  requestAnimationFrame(() => {
    updateUI(result);
  });
});`}</pre>
          </div>
        </div>
      </div>

      <div className="demo-section log-section">
        <h3>📋 执行日志</h3>
        <button onClick={clearLog} className="clear-btn">清空日志</button>
        <div className="log-container">
          {log.length === 0 ? (
            <div className="empty-log">暂无日志</div>
          ) : (
            log.map((entry, index) => (
              <div key={index} className="log-entry">
                {entry}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="summary">
        <h3>📝 总结</h3>
        <ul>
          <li><strong>requestIdleCallback</strong> 用于在浏览器空闲时执行低优先级任务</li>
          <li>它不会干扰动画、用户输入等高优先级工作</li>
          <li>可以设置超时，确保任务最终会被执行</li>
          <li>React Fiber 的调度思想受其启发，但实现了更强大的自定义调度器</li>
          <li>适合数据分析、日志、预加载等<strong>不紧急但重要</strong>的任务</li>
        </ul>
      </div>
    </div>
  );
};

export default RequestIdleCallbackDemo;

