import React, { useState, useRef, useEffect } from 'react';
import './PriorityScheduling.css';

/**
 * React 任务优先级调度演示
 * 展示 Fiber 如何处理不同优先级的更新
 */

// 优先级定义
enum TaskPriority {
  Immediate = 1,      // 同步执行，如用户输入
  UserBlocking = 2,   // 用户交互，250ms 内完成
  Normal = 3,         // 默认优先级，5s 超时
  Low = 4,           // 低优先级，10s 超时
  Idle = 5           // 空闲时执行，永不超时
}

interface ScheduledTask {
  id: number;
  name: string;
  priority: TaskPriority;
  duration: number;
  color: string;
  status: 'pending' | 'running' | 'completed' | 'interrupted';
  startTime?: number;
  endTime?: number;
}


class TimeSliceScheduler {
  private taskQueue: ScheduledTask[] = [];
  private currentTask: ScheduledTask | null = null;
  private isScheduled = false;
  private static FRAME_TIME = 16; // 16ms ≈ 60fps

  private onTaskUpdate: (task: ScheduledTask) => void;
  private onQueueUpdate: (queue: ScheduledTask[]) => void;

  constructor(
    onTaskUpdate: (task: ScheduledTask) => void,
    onQueueUpdate: (queue: ScheduledTask[]) => void
  ) {
    this.onTaskUpdate = onTaskUpdate;
    this.onQueueUpdate = onQueueUpdate;
  }

  scheduleTask(task: ScheduledTask) {
    this.taskQueue.push(task);
    this.sortQueue();
    this.onQueueUpdate([...this.taskQueue]);

    if (!this.isScheduled) {
      this.isScheduled = true;
      this.scheduleWork();
    }
  }

  private sortQueue() {
    this.taskQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.id - b.id;
    });
  }

  private scheduleWork() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(
        (deadline) => this.workLoop(deadline),
        { timeout: TimeSliceScheduler.FRAME_TIME }
      );
    } else {
      requestAnimationFrame((timestamp) => {
        const fakeDeadline = {
          timeRemaining: () => Math.max(0, TimeSliceScheduler.FRAME_TIME - (performance.now() % TimeSliceScheduler.FRAME_TIME)),
          didTimeout: false,
        };
        this.workLoop(fakeDeadline as IdleDeadline);
      });
    }
  }

  private workLoop(deadline: IdleDeadline) {
    if (!this.currentTask && this.taskQueue.length > 0) {
      this.currentTask = this.taskQueue.shift()!;
      this.currentTask.status = 'running';
      this.currentTask.startTime = performance.now();
      this.onTaskUpdate({ ...this.currentTask });
      this.onQueueUpdate([...this.taskQueue]);
    }

    if (this.currentTask) {
      const task = this.currentTask;

      if (task.priority === TaskPriority.Immediate) {
        this.executeTask(task);
      } else {
        if (deadline.timeRemaining() <= 0) {
          if (this.hasHigherPriorityTask(task)) {
            task.status = 'interrupted';
            this.onTaskUpdate({ ...task });
            this.taskQueue.unshift(task);
            this.sortQueue();
            this.currentTask = null;
          }
          this.scheduleWork();
          return;
        } else {
          this.executeTask(task);
        }
      }
    } else if (this.taskQueue.length > 0) {
      this.scheduleWork();
    } else {
      this.isScheduled = false;
    }
  }

  private executeTask(task: ScheduledTask) {
    setTimeout(() => {
      task.status = 'completed';
      task.endTime = performance.now();
      this.onTaskUpdate({ ...task });
      this.currentTask = null;
      if (this.taskQueue.length > 0) {
        this.scheduleWork();
      } else {
        this.isScheduled = false;
      }
    }, task.duration);
  }

  private hasHigherPriorityTask(currentTask: ScheduledTask): boolean {
    return this.taskQueue.length > 0 && this.taskQueue[0].priority < currentTask.priority;
  }

  clear() {
    this.taskQueue = [];
    this.currentTask = null;
    this.isScheduled = false;
    this.onQueueUpdate([]);
  }
}


const PriorityScheduling: React.FC = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [queue, setQueue] = useState<ScheduledTask[]>([]);
  const [taskIdCounter, setTaskIdCounter] = useState(1);
  const schedulerRef = useRef<TimeSliceScheduler | null>(null);

  useEffect(() => {
    schedulerRef.current = new TimeSliceScheduler(
      (task) => {
        setTasks(prev => {
          const index = prev.findIndex(t => t.id === task.id);
          if (index >= 0) {
            const newTasks = [...prev];
            newTasks[index] = task;
            return newTasks;
          }
          return [...prev, task];
        });
      },
      (queue) => {
        setQueue(queue);
      }
    );
  }, []);

  const addTask = (priority: TaskPriority, name: string, duration: number, color: string) => {
    const task: ScheduledTask = {
      id: taskIdCounter,
      name,
      priority,
      duration,
      color,
      status: 'pending',
    };
    
    setTaskIdCounter(prev => prev + 1);
    schedulerRef.current?.scheduleTask(task);
  };

  const runDemo = () => {
    setTasks([]);
    schedulerRef.current?.clear();
    setTaskIdCounter(1);
    
    // 模拟一系列任务
    setTimeout(() => addTask(TaskPriority.Low, '数据预加载', 1000, '#ffd700'), 100);
    setTimeout(() => addTask(TaskPriority.Normal, '列表渲染', 800, '#61dafb'), 200);
    setTimeout(() => addTask(TaskPriority.Low, '图片懒加载', 1200, '#ffd700'), 300);
    setTimeout(() => addTask(TaskPriority.UserBlocking, '按钮点击响应', 300, '#ff6b9d'), 500);
    setTimeout(() => addTask(TaskPriority.Immediate, '用户输入', 200, '#ff4444'), 700);
    setTimeout(() => addTask(TaskPriority.Normal, '动画更新', 600, '#61dafb'), 900);
    setTimeout(() => addTask(TaskPriority.Idle, '统计分析', 500, '#888'), 1100);
  };

  const getPriorityName = (priority: TaskPriority): string => {
    const names = {
      [TaskPriority.Immediate]: 'IMMEDIATE',
      [TaskPriority.UserBlocking]: 'USER_BLOCKING',
      [TaskPriority.Normal]: 'NORMAL',
      [TaskPriority.Low]: 'LOW',
      [TaskPriority.Idle]: 'IDLE',
    };
    return names[priority];
  };

  const getStatusIcon = (status: string): string => {
    const icons = {
      pending: '⏳',
      running: '⚡',
      completed: '✅',
      interrupted: '🔄',
    };
    return icons[status as keyof typeof icons] || '❓';
  };

  return (
    <div className="priority-scheduling">
      <h2>🎯 任务优先级调度演示</h2>
      <p className="description">
        React Fiber 为不同类型的更新分配不同的优先级。
        高优先级任务（如用户输入）可以打断低优先级任务（如数据预加载），
        确保用户交互的流畅性。
      </p>

      <div className="demo-section">
        <h3>交互式演示</h3>
        <p>点击按钮运行演示，观察不同优先级任务的调度过程</p>
        <button onClick={runDemo} className="run-button">
          🚀 运行调度演示
        </button>

        <div className="control-panel">
          <h4>快速添加任务</h4>
          <div className="button-group">
            <button 
              onClick={() => addTask(TaskPriority.Immediate, '紧急任务', 200, '#ff4444')}
              className="priority-btn immediate"
            >
              立即执行
            </button>
            <button 
              onClick={() => addTask(TaskPriority.UserBlocking, '用户交互', 300, '#ff6b9d')}
              className="priority-btn user-blocking"
            >
              用户交互
            </button>
            <button 
              onClick={() => addTask(TaskPriority.Normal, '普通更新', 600, '#61dafb')}
              className="priority-btn normal"
            >
              普通优先级
            </button>
            <button 
              onClick={() => addTask(TaskPriority.Low, '低优先级', 1000, '#ffd700')}
              className="priority-btn low"
            >
              低优先级
            </button>
            <button 
              onClick={() => addTask(TaskPriority.Idle, '空闲任务', 500, '#888')}
              className="priority-btn idle"
            >
              空闲执行
            </button>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>任务队列状态</h3>
        <div className="queue-container">
          <h4>等待队列 ({queue.length})</h4>
          {queue.length === 0 ? (
            <div className="empty-queue">队列为空</div>
          ) : (
            <div className="queue-list">
              {queue.map((task, index) => (
                <div 
                  key={task.id} 
                  className="queue-item"
                  style={{ borderLeftColor: task.color }}
                >
                  <span className="queue-position">#{index + 1}</span>
                  <span className="task-name">{task.name}</span>
                  <span className="task-priority">{getPriorityName(task.priority)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="demo-section">
        <h3>任务执行时间线</h3>
        <div className="timeline-container">
          {tasks.length === 0 ? (
            <div className="empty-timeline">暂无任务</div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="timeline-item">
                <div className="task-info">
                  <span className="status-icon">{getStatusIcon(task.status)}</span>
                  <span className="task-id">#{task.id}</span>
                  <span className="task-name">{task.name}</span>
                  <span 
                    className="task-priority-badge"
                    style={{ background: task.color }}
                  >
                    {getPriorityName(task.priority)}
                  </span>
                  <span className="task-status">{task.status.toUpperCase()}</span>
                </div>
                <div className="task-bar-container">
                  <div 
                    className={`task-bar ${task.status}`}
                    style={{ 
                      background: task.color,
                      width: task.status === 'completed' ? '100%' : 
                             task.status === 'running' ? '50%' : '0%'
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="demo-section priority-explanation">
        <h3>📚 优先级说明</h3>
        
        <div className="priority-grid">
          <div className="priority-card immediate">
            <h4>🔥 IMMEDIATE (立即执行)</h4>
            <ul>
              <li>优先级最高，同步执行</li>
              <li>示例：用户输入、点击事件</li>
              <li>不会被其他任务打断</li>
              <li>React 中对应：flushSync</li>
            </ul>
          </div>

          <div className="priority-card user-blocking">
            <h4>⚡ USER_BLOCKING (用户交互)</h4>
            <ul>
              <li>需要在 250ms 内完成</li>
              <li>示例：按钮反馈、悬停效果</li>
              <li>可以打断低优先级任务</li>
              <li>React 中对应：useTransition 的非紧急更新</li>
            </ul>
          </div>

          <div className="priority-card normal">
            <h4>🎨 NORMAL (普通优先级)</h4>
            <ul>
              <li>默认优先级，5s 超时</li>
              <li>示例：网络请求响应、列表渲染</li>
              <li>大多数更新属于此类</li>
              <li>React 中对应：默认的 setState</li>
            </ul>
          </div>

          <div className="priority-card low">
            <h4>🔽 LOW (低优先级)</h4>
            <ul>
              <li>10s 超时</li>
              <li>示例：数据预加载、非关键渲染</li>
              <li>容易被高优先级任务打断</li>
              <li>React 中对应：offscreen 内容</li>
            </ul>
          </div>

          <div className="priority-card idle">
            <h4>💤 IDLE (空闲执行)</h4>
            <ul>
              <li>永不超时，空闲时执行</li>
              <li>示例：分析统计、日志上报</li>
              <li>优先级最低</li>
              <li>React 中对应：暂无直接 API</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>🎓 Fiber 调度核心机制</h3>
        
        <div className="mechanism-grid">
          <div className="mechanism-card">
            <h4>1️⃣ 时间切片 (Time Slicing)</h4>
            <pre>{`每帧预算: ~5ms
剩余时间: 浏览器其他任务
工作单元: 一个 Fiber 节点的处理

function workLoop(deadline) {
  while (workInProgress && 
         !shouldYield()) {
    workInProgress = performUnitOfWork(
      workInProgress
    );
  }
}`}</pre>
          </div>

          <div className="mechanism-card">
            <h4>2️⃣ 优先级队列</h4>
            <pre>{`任务按优先级排序
高优先级可打断低优先级

taskQueue.sort(
  (a, b) => a.priority - b.priority
);

if (hasHigherPriorityWork()) {
  interrupt(currentWork);
  schedule(higherPriorityWork);
}`}</pre>
          </div>

          <div className="mechanism-card">
            <h4>3️⃣ 双缓冲技术</h4>
            <pre>{`current: 屏幕上显示的树
workInProgress: 正在构建的树

// 构建完成后交换
root.current = finishedWork;

// 下次更新基于 current 克隆
workInProgress = createWorkInProgress(
  current
);`}</pre>
          </div>

          <div className="mechanism-card">
            <h4>4️⃣ 饥饿问题处理</h4>
            <pre>{`每个任务都有过期时间
超时后提升优先级

expirationTime = 
  currentTime + timeout;

if (currentTime > expirationTime) {
  // 过期了，立即执行
  flushExpiredWork(task);
}`}</pre>
          </div>
        </div>
      </div>

      <div className="summary">
        <h3>💡 关键要点</h3>
        <ul>
          <li><strong>可中断</strong>：渲染工作可以被高优先级任务打断</li>
          <li><strong>优先级</strong>：不同更新有不同的优先级和超时时间</li>
          <li><strong>时间切片</strong>：长任务被分割成小块，避免阻塞主线程</li>
          <li><strong>并发渲染</strong>：可以同时准备多个版本的 UI</li>
          <li><strong>用户体验</strong>：高优先级交互总是能快速响应</li>
        </ul>
      </div>
    </div>
  );
};

export default PriorityScheduling;

