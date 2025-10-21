import React, { useState, useRef, JSX } from 'react';
import './FiberArchitecture.css';
import {
  SimpleFiber,
  Priority,
  Task,
  VirtualElement,
  createFiberTree,
  reconcileChildren,
  createDOMTree,
  PriorityScheduler,
} from './fiber-architecture';

const FiberArchitecture: React.FC = () => {
  const [fiberTree, setFiberTree] = useState<SimpleFiber | null>(null);
  const [buildProgress, setBuildProgress] = useState<string[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [executedTasks, setExecutedTasks] = useState<string[]>([]);
  const schedulerRef = useRef(new PriorityScheduler());
  const [currentTree, setCurrentTree] = useState<SimpleFiber | null>(null);
  const [workInProgressTree, setWorkInProgressTree] = useState<SimpleFiber | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [diffEffects, setDiffEffects] = useState<string[]>([]);
  const [isDiffing, setIsDiffing] = useState(false);
  const [domPreview, setDomPreview] = useState<string>('');
  const renderContainerRef = useRef<HTMLDivElement>(null);

  const buildFiberTree = async () => {
    setIsBuilding(true);
    setBuildProgress([]);
    
    const virtualDOM: VirtualElement = {
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

    const build = () => {
      const start = performance.now();
      
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

      requestAnimationFrame(build);
    };

    build();
    setFiberTree(rootFiber);
  };

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

    tasks.sort(() => Math.random() - 0.5).forEach(task => {
      scheduler.addTask(task);
    });
  };
  
  const demonstrateDoubleBuffering = () => {
    setIsSwapping(true);
    
    const oldVirtualDOM: VirtualElement = {
      type: 'div',
      props: { id: 'app', className: 'old' },
      children: [
        { type: 'h1', props: { className: 'title' }, children: [{ type: 'text', props: { value: '旧标题' }, children: [] }] },
        { type: 'p', props: {}, children: [{ type: 'text', props: { value: '旧内容' }, children: [] }] },
      ],
    };
    
    const gen1 = createFiberTree(oldVirtualDOM);
    let oldRoot: SimpleFiber | null = null;
    let result = gen1.next();
    while (!result.done) {
      if (!oldRoot) oldRoot = result.value;
      result = gen1.next();
    }
    setCurrentTree(oldRoot);
    
    setTimeout(() => {
      const newVirtualDOM: VirtualElement = {
        type: 'div',
        props: { id: 'app', className: 'new' },
        children: [
          { type: 'h1', props: { className: 'title' }, children: [{ type: 'text', props: { value: '新标题' }, children: [] }] },
          { type: 'p', props: {}, children: [{ type: 'text', props: { value: '新内容' }, children: [] }] },
          { type: 'button', props: {}, children: [{ type: 'text', props: { value: '新按钮' }, children: [] }] },
        ],
      };
      
      const gen2 = createFiberTree(newVirtualDOM);
      let newRoot: SimpleFiber | null = null;
      let r = gen2.next();
      while (!r.done) {
        if (!newRoot) newRoot = r.value;
        r = gen2.next();
      }
      
      if (oldRoot && newRoot) {
        oldRoot.alternate = newRoot;
        newRoot.alternate = oldRoot;
      }
      
      setWorkInProgressTree(newRoot);
      
      setTimeout(() => {
        setCurrentTree(newRoot);
        setWorkInProgressTree(null);
        setIsSwapping(false);
      }, 2000);
    }, 1000);
  };
  
  const demonstrateDiff = () => {
    setIsDiffing(true);
    setDiffEffects([]);
    
    const oldVirtualDOM: VirtualElement = {
      type: 'ul',
      props: { className: 'list' },
      children: [
        { type: 'li', props: { key: '1' }, children: [{ type: 'text', props: { value: 'Item 1' }, children: [] }] },
        { type: 'li', props: { key: '2' }, children: [{ type: 'text', props: { value: 'Item 2' }, children: [] }] },
        { type: 'li', props: { key: '3' }, children: [{ type: 'text', props: { value: 'Item 3' }, children: [] }] },
      ],
    };
    
    const gen1 = createFiberTree(oldVirtualDOM);
    let oldRoot: SimpleFiber | null = null;
    let r1 = gen1.next();
    while (!r1.done) {
      if (!oldRoot) oldRoot = r1.value;
      r1 = gen1.next();
    }
    
    setDiffEffects(['📌 旧树构建完成']);
    
    setTimeout(() => {
      const newChildren: VirtualElement[] = [
        { type: 'li', props: { key: '1' }, children: [{ type: 'text', props: { value: 'Item 1' }, children: [] }] },
        { type: 'li', props: { key: '2' }, children: [{ type: 'text', props: { value: 'Item 2 - Updated' }, children: [] }] },
        { type: 'li', props: { key: '4' }, children: [{ type: 'text', props: { value: 'Item 4 - New' }, children: [] }] },
      ];
      
      const result = reconcileChildren(oldRoot, newChildren);
      
      if (result) {
        setDiffEffects(prev => [
          ...prev,
          '🔍 开始 Diff 算法...',
          ...result.effects,
          '✅ Diff 完成！',
        ]);
      }
      
      setTimeout(() => {
        setIsDiffing(false);
      }, 3000);
    }, 1000);
  };
  
  const demonstrateFiberToDOM = () => {
    const virtualDOM: VirtualElement = {
      type: 'div',
      props: { id: 'demo', className: 'demo-container', style: { padding: '10px', backgroundColor: '#f0f0f0' } },
      children: [
        { type: 'h2', props: { style: { color: '#333' } }, children: [{ type: 'text', props: { value: 'Fiber 生成的 DOM' }, children: [] }] },
        { type: 'p', props: {}, children: [{ type: 'text', props: { value: '这是通过 Fiber 树转换的真实 DOM' }, children: [] }] },
        { 
          type: 'button', 
          props: { 
            style: { padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
          }, 
          children: [{ type: 'text', props: { value: '点击我' }, children: [] }] 
        },
      ],
    };
    
    const gen = createFiberTree(virtualDOM);
    let root: SimpleFiber | null = null;
    let r = gen.next();
    while (!r.done) {
      if (!root) root = r.value;
      r = gen.next();
    }
    
    if (root && renderContainerRef.current) {
      renderContainerRef.current.innerHTML = '';
      
      const domTree = createDOMTree(root);
      if (domTree) {
        renderContainerRef.current.appendChild(domTree);
        const htmlString = domTree instanceof HTMLElement ? domTree.outerHTML : domTree.textContent || '';
        setDomPreview(htmlString);
      }
    }
  };

  const renderFiberTree = (fiber: SimpleFiber | null, level: number = 0): JSX.Element[] => {
    if (!fiber) return [];

    const elements: JSX.Element[] = [];
    const indent = '　'.repeat(level);
    
    elements.push(
      <div key={`${fiber.type}-${level}-${Math.random()}`} className="fiber-node" style={{ marginLeft: `${level * 20}px` }}>
        {indent}
        <span className="fiber-type">{fiber.type}</span>
        <span className="fiber-props">{JSON.stringify(fiber.props).substring(0, 40)}</span>
      </div>
    );

    if (fiber.child) {
      elements.push(...renderFiberTree(fiber.child, level + 1));
    }

    if (fiber.sibling) {
      elements.push(...renderFiberTree(fiber.sibling, level));
    }

    return elements;
  };

  return (
    <div className="fiber-architecture">
      <h2>🏗️ React Fiber 架构演示（重构版）</h2>
      <p className="description">
        Fiber 架构使 React 能够将渲染工作分解成小单元，并能够暂停、恢复和优先级调度。
        这样可以让浏览器有时间处理用户输入等高优先级任务，避免页面卡顿。
      </p>
      
      <div className="info-box" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '4px', border: '1px solid #2196f3' }}>
        <h4>📦 代码已模块化重构</h4>
        <p style={{ margin: '10px 0' }}>原文件已按逻辑拆分为以下模块：</p>
        <ul style={{ marginLeft: '20px' }}>
          <li><code>types/</code> - 类型定义</li>
          <li><code>core/</code> - SimpleFiber 核心类</li>
          <li><code>utils/</code> - Fiber 树构建、Diff 算法、DOM 转换工具</li>
          <li><code>schedulers/</code> - 优先级调度器和 Fiber 调度器</li>
        </ul>
      </div>

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

      <div className="demo-section">
        <h3>3. 双缓冲机制（Double Buffering）</h3>
        <p>React 使用 current 和 workInProgress 两棵树，构建完成后交换指针，实现无闪烁更新</p>
        <button onClick={demonstrateDoubleBuffering} disabled={isSwapping}>
          {isSwapping ? '切换中...' : '演示双缓冲机制'}
        </button>
        
        <div className="two-columns">
          <div className="column">
            <h4>Current Tree（当前显示）</h4>
            <div className="tree-container" style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px' }}>
              {currentTree ? renderFiberTree(currentTree) : <div className="empty-state">暂无数据</div>}
            </div>
          </div>
          
          <div className="column">
            <h4>WorkInProgress Tree（正在构建）</h4>
            <div className="tree-container" style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '4px' }}>
              {workInProgressTree ? renderFiberTree(workInProgressTree) : <div className="empty-state">暂无数据</div>}
            </div>
          </div>
        </div>
        
        <div className="explanation-box" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h4>💡 工作原理：</h4>
          <ol>
            <li><strong>Current Tree</strong>: 当前屏幕上显示的 Fiber 树</li>
            <li><strong>WorkInProgress Tree</strong>: 正在内存中构建的新树</li>
            <li><strong>Alternate</strong>: 两棵树通过 alternate 属性互相引用</li>
            <li><strong>Commit</strong>: 构建完成后，交换 current 指针，瞬间完成更新</li>
          </ol>
        </div>
      </div>

      <div className="demo-section">
        <h3>4. Diff 算法流程（Reconciliation）</h3>
        <p>比较新旧 Fiber 树，标记需要的 DOM 操作（增删改）</p>
        <button onClick={demonstrateDiff} disabled={isDiffing}>
          {isDiffing ? 'Diff 中...' : '运行 Diff 算法'}
        </button>
        
        <div className="diff-log" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
          {diffEffects.length > 0 ? (
            diffEffects.map((effect, i) => (
              <div key={i} className="diff-entry" style={{ padding: '5px 0', borderBottom: '1px solid #ddd' }}>
                {effect}
              </div>
            ))
          ) : (
            <div className="empty-state">点击按钮查看 Diff 过程</div>
          )}
        </div>
        
        <div className="explanation-box" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h4>🔍 Diff 算法步骤：</h4>
          <ol>
            <li><strong>比较类型</strong>: 检查新旧节点的 type 是否相同</li>
            <li><strong>PLACEMENT</strong>: type 不同或新增节点 → 创建新 DOM</li>
            <li><strong>UPDATE</strong>: type 相同但 props 不同 → 更新 DOM 属性</li>
            <li><strong>DELETION</strong>: 旧节点不在新树中 → 删除 DOM</li>
            <li><strong>复用节点</strong>: type 相同时复用 DOM，只更新必要的部分</li>
          </ol>
        </div>
      </div>

      <div className="demo-section">
        <h3>5. Fiber 树转 DOM</h3>
        <p>将 Fiber 树转换为真实的浏览器 DOM 节点</p>
        <button onClick={demonstrateFiberToDOM}>生成 DOM</button>
        
        <div className="two-columns">
          <div className="column">
            <h4>实际渲染的 DOM</h4>
            <div 
              ref={renderContainerRef} 
              style={{ 
                border: '2px solid #ddd', 
                borderRadius: '4px', 
                minHeight: '150px', 
                padding: '10px',
                backgroundColor: 'white'
              }}
            />
          </div>
          
          <div className="column">
            <h4>生成的 HTML 代码</h4>
            <pre style={{ 
              backgroundColor: '#282c34', 
              color: '#abb2bf', 
              padding: '15px', 
              borderRadius: '4px', 
              fontSize: '12px',
              maxHeight: '300px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}>
              {domPreview || '点击按钮生成 DOM'}
            </pre>
          </div>
        </div>
        
        <div className="explanation-box" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h4>🌐 转换流程：</h4>
          <ol>
            <li><strong>遍历 Fiber 树</strong>: 深度优先遍历每个 Fiber 节点</li>
            <li><strong>创建 DOM 节点</strong>: 根据 fiber.type 创建对应的 DOM 元素</li>
            <li><strong>设置属性</strong>: 将 fiber.props 应用到 DOM 节点</li>
            <li><strong>建立父子关系</strong>: appendChild 构建 DOM 树结构</li>
            <li><strong>挂载到页面</strong>: 最终将根节点添加到容器中</li>
          </ol>
        </div>
      </div>

      <div className="demo-section architecture-diagram">
        <h3>6. Fiber 架构核心概念</h3>
        
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

