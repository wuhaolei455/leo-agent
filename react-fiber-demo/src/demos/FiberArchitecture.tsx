import React, { useState, useRef, JSX } from 'react';
import './FiberArchitecture.css';

/**
 * React Fiber 架构演示
 * Fiber 是 React 16 引入的新协调引擎，实现了可中断的渲染
 */

// 定义 Fiber 节点类型（用于文档说明）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface FiberNode {
  type: string;
  props: any;
  child?: FiberNode;
  sibling?: FiberNode;
  parent?: FiberNode;
  effectTag?: 'PLACEMENT' | 'UPDATE' | 'DELETION';
  alternate?: FiberNode;
}

// 1. 模拟简单的 Fiber 树结构
class SimpleFiber {
  type: string;
  props: any;
  child: SimpleFiber | null = null;
  sibling: SimpleFiber | null = null;
  parent: SimpleFiber | null = null;

  constructor(type: string, props: any) {
    this.type = type;
    this.props = props;
  }
}

// 2. 创建 Fiber 树的 Generator
function* createFiberTree(element: any, parent: SimpleFiber | null = null): Generator<SimpleFiber> {
  const fiber = new SimpleFiber(element.type, element.props);
  fiber.parent = parent;

  yield fiber; // 每创建一个节点就 yield，模拟可中断

  // 处理子节点
  if (element.children && element.children.length > 0) {
    let previousFiber: SimpleFiber | null = null;

    for (let i = 0; i < element.children.length; i++) {
      const childGenerator = createFiberTree(element.children[i], fiber);
      let result = childGenerator.next();

      while (!result.done) {
        const childFiber = result.value;
        yield childFiber; // 递归创建子树时也可以中断

        if (i === 0) {
          fiber.child = childFiber;
        } else if (previousFiber) {
          previousFiber.sibling = childFiber;
        }

        previousFiber = childFiber;
        result = childGenerator.next();
      }
    }
  }

  return fiber;
}

// 3. 模拟工作循环（Work Loop）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class FiberScheduler {
  private workInProgress: Generator | null = null;
  private deadline: number = 0;
  private taskQueue: Array<() => Generator> = [];
  
  // 每帧的时间片（毫秒）
  private static FRAME_BUDGET = 16; // 约60fps

  // 开始调度
  scheduleWork(task: () => Generator) {
    this.taskQueue.push(task);
    this.requestIdleCallback();
  }

  // 模拟 requestIdleCallback
  private requestIdleCallback() {
    requestAnimationFrame((timestamp) => {
      this.deadline = timestamp + FiberScheduler.FRAME_BUDGET;
      this.workLoop();
    });
  }

  // 工作循环
  private workLoop() {
    // 如果没有正在进行的工作，从队列中取一个
    if (!this.workInProgress && this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (task) {
        this.workInProgress = task();
      }
    }

    // 执行工作，直到时间片用完或工作完成
    while (this.workInProgress && this.shouldYield() === false) {
      const result = this.workInProgress.next();
      if (result.done) {
        this.workInProgress = null;
        break;
      }
    }

    // 如果还有工作，继续调度
    if (this.workInProgress || this.taskQueue.length > 0) {
      this.requestIdleCallback();
    }
  }

  // 判断是否应该让出控制权
  private shouldYield(): boolean {
    return performance.now() >= this.deadline;
  }
}

// 4. 优先级队列
enum Priority {
  IMMEDIATE = 1,    // 立即执行
  USER_BLOCKING = 2, // 用户交互
  NORMAL = 3,        // 普通渲染
  LOW = 4,          // 低优先级
  IDLE = 5          // 空闲时执行
}

interface Task {
  id: number;
  priority: Priority;
  execute: () => void;
  name: string;
}

class PriorityScheduler {
  private tasks: Task[] = [];
  private currentTask: Task | null = null;
  private isRunning = false;

  addTask(task: Task) {
    this.tasks.push(task);
    // 按优先级排序
    this.tasks.sort((a, b) => a.priority - b.priority);
    
    if (!this.isRunning) {
      this.schedule();
    }
  }

  private schedule() {
    if (this.tasks.length === 0) {
      this.isRunning = false;
      return;
    }

    this.isRunning = true;
    this.currentTask = this.tasks.shift() || null;

    if (this.currentTask) {
      // 根据优先级选择调度方式
      if (this.currentTask.priority === Priority.IMMEDIATE) {
        this.currentTask.execute();
        this.schedule();
      } else {
        requestAnimationFrame(() => {
          if (this.currentTask) {
            this.currentTask.execute();
          }
          this.schedule();
        });
      }
    }
  }

  getCurrentTask(): Task | null {
    return this.currentTask;
  }

  getPendingTasks(): Task[] {
    return this.tasks;
  }
}

const FiberArchitecture: React.FC = () => {
  const [fiberTree, setFiberTree] = useState<SimpleFiber | null>(null);
  const [buildProgress, setBuildProgress] = useState<string[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [executedTasks, setExecutedTasks] = useState<string[]>([]);
  const schedulerRef = useRef(new PriorityScheduler());

  // 演示1: 构建 Fiber 树
  const buildFiberTree = async () => {
    setIsBuilding(true);
    setBuildProgress([]);
    
    // 定义一个虚拟 DOM 树
    const virtualDOM = {
      type: 'div',
      props: { id: 'root' },
      children: [
        {
          type: 'h1',
          props: { className: 'title' },
          children: [{ type: 'text', props: { value: 'Hello Fiber' }, children: [] }],
        },
        {
          type: 'ul',
          props: { className: 'list' },
          children: [
            { type: 'li', props: {}, children: [{ type: 'text', props: { value: 'Item 1' }, children: [] }] },
            { type: 'li', props: {}, children: [{ type: 'text', props: { value: 'Item 2' }, children: [] }] },
            { type: 'li', props: {}, children: [{ type: 'text', props: { value: 'Item 3' }, children: [] }] },
          ],
        },
        {
          type: 'button',
          props: { onClick: () => {} },
          children: [{ type: 'text', props: { value: 'Click me' }, children: [] }],
        },
      ],
    };

    const generator = createFiberTree(virtualDOM);
    const progress: string[] = [];
    let rootFiber: SimpleFiber | null = null;

    // 模拟可中断的构建过程
    const build = () => {
      const start = performance.now();
      
      // 每帧最多执行5ms的工作
      while (performance.now() - start < 5) {
        const result = generator.next();
        
        if (result.done) {
          setIsBuilding(false);
          return;
        }

        const fiber = result.value;
        if (!rootFiber) rootFiber = fiber;
        
        progress.push(
          `创建 Fiber 节点: <${fiber.type}> ${JSON.stringify(fiber.props).substring(0, 30)}...`
        );
        setBuildProgress([...progress]);
      }

      // 让出控制权，在下一帧继续
      requestAnimationFrame(build);
    };

    build();
    setFiberTree(rootFiber);
  };

  // 演示2: 任务优先级调度
  const runPriorityDemo = () => {
    setExecutedTasks([]);
    const scheduler = schedulerRef.current;
    
    const tasks: Task[] = [
      {
        id: 1,
        priority: Priority.LOW,
        name: '低优先级任务 - 数据预加载',
        execute: () => {
          setExecutedTasks(prev => [...prev, '✅ 执行: 低优先级任务 - 数据预加载']);
        },
      },
      {
        id: 2,
        priority: Priority.IMMEDIATE,
        name: '立即执行 - 用户点击事件',
        execute: () => {
          setExecutedTasks(prev => [...prev, '🚀 执行: 立即执行 - 用户点击事件']);
        },
      },
      {
        id: 3,
        priority: Priority.NORMAL,
        name: '普通优先级 - 列表渲染',
        execute: () => {
          setExecutedTasks(prev => [...prev, '⚡ 执行: 普通优先级 - 列表渲染']);
        },
      },
      {
        id: 4,
        priority: Priority.USER_BLOCKING,
        name: '用户阻塞 - 输入响应',
        execute: () => {
          setExecutedTasks(prev => [...prev, '⭐ 执行: 用户阻塞 - 输入响应']);
        },
      },
      {
        id: 5,
        priority: Priority.IDLE,
        name: '空闲时执行 - 分析统计',
        execute: () => {
          setExecutedTasks(prev => [...prev, '💤 执行: 空闲时执行 - 分析统计']);
        },
      },
    ];

    // 随机顺序添加任务，但会按优先级执行
    tasks.sort(() => Math.random() - 0.5).forEach(task => {
      scheduler.addTask(task);
    });
  };

  // 可视化 Fiber 树
  const renderFiberTree = (fiber: SimpleFiber | null, level: number = 0): JSX.Element[] => {
    if (!fiber) return [];

    const elements: JSX.Element[] = [];
    const indent = '　'.repeat(level);
    
    elements.push(
      <div key={`${fiber.type}-${level}`} className="fiber-node" style={{ marginLeft: `${level * 20}px` }}>
        {indent}
        <span className="fiber-type">{fiber.type}</span>
        <span className="fiber-props">{JSON.stringify(fiber.props).substring(0, 40)}</span>
      </div>
    );

    // 渲染子节点
    if (fiber.child) {
      elements.push(...renderFiberTree(fiber.child, level + 1));
    }

    // 渲染兄弟节点
    if (fiber.sibling) {
      elements.push(...renderFiberTree(fiber.sibling, level));
    }

    return elements;
  };

  return (
    <div className="fiber-architecture">
      <h2>🏗️ React Fiber 架构演示</h2>
      <p className="description">
        Fiber 架构使 React 能够将渲染工作分解成小单元，并能够暂停、恢复和优先级调度。
        这样可以让浏览器有时间处理用户输入等高优先级任务，避免页面卡顿。
      </p>

      <div className="demo-section">
        <h3>1. Fiber 树的构建过程</h3>
        <p>Fiber 将虚拟 DOM 树转换为 Fiber 树，每个节点的创建都可以被中断</p>
        <button onClick={buildFiberTree} disabled={isBuilding}>
          {isBuilding ? '构建中...' : '开始构建 Fiber 树'}
        </button>
        
        <div className="two-columns">
          <div className="column">
            <h4>构建进度 {isBuilding && '(可中断)'}</h4>
            <div className="log-container">
              {buildProgress.map((log, i) => (
                <div key={i} className="log-entry">
                  {log}
                </div>
              ))}
            </div>
          </div>
          
          <div className="column">
            <h4>Fiber 树结构</h4>
            <div className="tree-container">
              {fiberTree && renderFiberTree(fiberTree)}
            </div>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>2. 任务优先级调度</h3>
        <p>Fiber 为不同类型的更新分配不同的优先级，高优先级任务可以打断低优先级任务</p>
        <button onClick={runPriorityDemo}>运行优先级调度演示</button>
        
        <div className="priority-explanation">
          <h4>优先级级别（从高到低）</h4>
          <ul>
            <li><strong>IMMEDIATE (1)</strong>: 立即执行，如用户点击</li>
            <li><strong>USER_BLOCKING (2)</strong>: 用户交互，如输入响应</li>
            <li><strong>NORMAL (3)</strong>: 普通渲染更新</li>
            <li><strong>LOW (4)</strong>: 低优先级，如数据预加载</li>
            <li><strong>IDLE (5)</strong>: 空闲时执行，如统计分析</li>
          </ul>
        </div>

        <div className="task-output">
          <h4>任务执行顺序（注意：虽然添加顺序随机，但执行按优先级）</h4>
          {executedTasks.map((task, i) => (
            <div key={i} className="task-entry">
              {task}
            </div>
          ))}
        </div>
      </div>

      <div className="demo-section architecture-diagram">
        <h3>3. Fiber 架构核心概念</h3>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h4>🔗 链表结构</h4>
            <p>Fiber 节点通过 child、sibling、parent 形成链表结构，方便遍历和中断</p>
            <pre>{`fiber.child   -> 第一个子节点
fiber.sibling -> 下一个兄弟节点  
fiber.parent  -> 父节点`}</pre>
          </div>

          <div className="concept-card">
            <h4>⏱️ 时间切片</h4>
            <p>将渲染工作分割成小块，每个时间片执行一部分，避免长时间阻塞主线程</p>
            <pre>{`每帧预算: ~16ms (60fps)
工作时间: ~5ms
剩余时间: 浏览器其他任务`}</pre>
          </div>

          <div className="concept-card">
            <h4>🎯 双缓冲</h4>
            <p>current 树和 workInProgress 树，完成后交换，实现流畅更新</p>
            <pre>{`current: 当前显示的树
workInProgress: 正在构建的树
alternate: 相互引用`}</pre>
          </div>

          <div className="concept-card">
            <h4>📊 优先级调度</h4>
            <p>不同更新有不同优先级，高优先级可以打断低优先级</p>
            <pre>{`expirationTime: 过期时间
lanes: 优先级通道
scheduler: 调度器`}</pre>
          </div>
        </div>
      </div>

      <div className="summary">
        <h3>🎓 Fiber vs Generator 对比</h3>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>特性</th>
              <th>Generator</th>
              <th>React Fiber</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>可中断性</td>
              <td>✅ 通过 yield 暂停和恢复</td>
              <td>✅ 通过链表结构实现可中断</td>
            </tr>
            <tr>
              <td>协程支持</td>
              <td>✅ 原生支持协程</td>
              <td>✅ 模拟协程行为</td>
            </tr>
            <tr>
              <td>实现方式</td>
              <td>语言特性</td>
              <td>数据结构 + 调度算法</td>
            </tr>
            <tr>
              <td>优先级</td>
              <td>❌ 不支持</td>
              <td>✅ 内置优先级系统</td>
            </tr>
            <tr>
              <td>为什么不直接用 Generator</td>
              <td colSpan={2}>
                Generator 是同步的，不能真正实现并发；
                Fiber 通过链表和调度器可以更灵活地控制执行顺序和优先级
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FiberArchitecture;

