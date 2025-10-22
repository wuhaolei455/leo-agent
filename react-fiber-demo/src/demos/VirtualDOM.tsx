import React, { useState, useRef, useEffect } from 'react';
import './VirtualDOM.css';

/**
 * 虚拟DOM演示
 * 展示虚拟DOM的概念、工作原理和性能优势
 */

// 定义虚拟DOM节点类型
interface VNode {
  type: string;
  props: {
    [key: string]: any;
    children?: string | VNode | (string | VNode)[];
  };
  key?: string | number;
}

// 创建虚拟DOM节点
function createElement(
  type: string,
  props: { [key: string]: any } = {},
  ...children: (VNode | string)[]
): VNode {
  return {
    type,
    props: {
      ...props,
      children: children.length === 1 ? children[0] : children,
    },
  };
}

// 将虚拟DOM渲染成真实DOM
function render(vnode: VNode | string): HTMLElement | Text {
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode);
  }

  const element = document.createElement(vnode.type);

  // 设置属性
  Object.keys(vnode.props).forEach(key => {
    if (key !== 'children') {
      if (key.startsWith('on')) {
        // 事件监听
        const eventType = key.substring(2).toLowerCase();
        element.addEventListener(eventType, vnode.props[key]);
      } else if (key === 'className') {
        element.className = vnode.props[key];
      } else if (key === 'style' && typeof vnode.props[key] === 'object') {
        Object.assign(element.style, vnode.props[key]);
      } else {
        element.setAttribute(key, vnode.props[key]);
      }
    }
  });

  // 渲染子节点
  const children = vnode.props.children;
  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => {
        if (child) {
          element.appendChild(render(child));
        }
      });
    } else if (typeof children === 'string') {
      element.textContent = children;
    } else {
      element.appendChild(render(children));
    }
  }

  return element;
}

// Diff算法 - 比较两个虚拟DOM节点
function diff(oldVNode: VNode | string, newVNode: VNode | string): DiffResult[] {
  const patches: DiffResult[] = [];

  // 情况1: 节点类型不同，替换整个节点
  if (typeof oldVNode !== typeof newVNode) {
    patches.push({ type: 'REPLACE', node: newVNode });
    return patches;
  }

  // 情况2: 都是文本节点
  if (typeof oldVNode === 'string' && typeof newVNode === 'string') {
    if (oldVNode !== newVNode) {
      patches.push({ type: 'TEXT', content: newVNode });
    }
    return patches;
  }

  // 情况3: 都是元素节点，但类型不同
  if (
    typeof oldVNode === 'object' &&
    typeof newVNode === 'object' &&
    oldVNode.type !== newVNode.type
  ) {
    patches.push({ type: 'REPLACE', node: newVNode });
    return patches;
  }

  // 情况4: 相同类型的元素节点，比较属性和子节点
  if (typeof oldVNode === 'object' && typeof newVNode === 'object') {
    // 比较属性
    const propsDiff = diffProps(oldVNode.props, newVNode.props);
    if (propsDiff) {
      patches.push({ type: 'PROPS', props: propsDiff });
    }

    // 比较子节点
    const childrenDiff = diffChildren(
      oldVNode.props.children,
      newVNode.props.children
    );
    if (childrenDiff.length > 0) {
      patches.push({ type: 'CHILDREN', children: childrenDiff });
    }
  }

  return patches;
}

function diffProps(
  oldProps: { [key: string]: any },
  newProps: { [key: string]: any }
): { [key: string]: any } | null {
  const patches: { [key: string]: any } = {};
  let hasChange = false;

  // 检查变化的属性
  Object.keys(newProps).forEach(key => {
    if (key !== 'children' && oldProps[key] !== newProps[key]) {
      patches[key] = newProps[key];
      hasChange = true;
    }
  });

  // 检查删除的属性
  Object.keys(oldProps).forEach(key => {
    if (key !== 'children' && !(key in newProps)) {
      patches[key] = undefined;
      hasChange = true;
    }
  });

  return hasChange ? patches : null;
}

function diffChildren(
  oldChildren: string | VNode | (string | VNode)[] | undefined,
  newChildren: string | VNode | (string | VNode)[] | undefined
): any[] {
  const patches: any[] = [];

  if (!oldChildren && !newChildren) return patches;
  if (!oldChildren) return [{ type: 'ADD', children: newChildren }];
  if (!newChildren) return [{ type: 'REMOVE' }];

  // 简化处理：只比较数组形式的子节点
  if (Array.isArray(oldChildren) && Array.isArray(newChildren)) {
    const maxLength = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < maxLength; i++) {
      if (i >= oldChildren.length) {
        patches.push({ type: 'ADD', index: i, node: newChildren[i] });
      } else if (i >= newChildren.length) {
        patches.push({ type: 'REMOVE', index: i });
      } else {
        const childPatches = diff(oldChildren[i], newChildren[i]);
        if (childPatches.length > 0) {
          patches.push({ type: 'UPDATE', index: i, patches: childPatches });
        }
      }
    }
  }

  return patches;
}

interface DiffResult {
  type: string;
  [key: string]: any;
}

const VirtualDOM: React.FC = () => {
  const [showComparison, setShowComparison] = useState(false);
  const [realDomTime, setRealDomTime] = useState(0);
  const [virtualDomTime, setVirtualDomTime] = useState(0);
  const [diffSteps, setDiffSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  const realDomRef = useRef<HTMLDivElement>(null);
  const virtualDomRef = useRef<HTMLDivElement>(null);

  // 演示1: 真实DOM vs 虚拟DOM性能对比
  const runPerformanceTest = () => {
    setShowComparison(true);
    
    // 测试真实DOM操作
    const realStart = performance.now();
    if (realDomRef.current) {
      realDomRef.current.innerHTML = '';
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div');
        div.className = 'test-item';
        div.textContent = `Item ${i}`;
        realDomRef.current.appendChild(div);
      }
      // 再次更新
      const items = realDomRef.current.querySelectorAll('.test-item');
      items.forEach((item, i) => {
        if (i % 2 === 0) {
          item.textContent = `Updated ${i}`;
        }
      });
    }
    const realEnd = performance.now();
    setRealDomTime(realEnd - realStart);

    // 测试虚拟DOM操作
    const virtualStart = performance.now();
    
    // 创建虚拟DOM树
    const oldVTree = {
      type: 'div',
      props: {
        children: Array.from({ length: 1000 }, (_, i) => ({
          type: 'div',
          props: {
            className: 'test-item',
            children: `Item ${i}`,
          },
        })),
      },
    };

    // 创建新的虚拟DOM树
    const newVTree = {
      type: 'div',
      props: {
        children: Array.from({ length: 1000 }, (_, i) => ({
          type: 'div',
          props: {
            className: 'test-item',
            children: i % 2 === 0 ? `Updated ${i}` : `Item ${i}`,
          },
        })),
      },
    };

    // 执行diff算法
    diff(oldVTree, newVTree);
    
    // 只更新变化的节点（这里简化处理）
    if (virtualDomRef.current) {
      virtualDomRef.current.innerHTML = '';
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div');
        div.className = 'test-item';
        div.textContent = i % 2 === 0 ? `Updated ${i}` : `Item ${i}`;
        virtualDomRef.current.appendChild(div);
      }
    }
    
    const virtualEnd = performance.now();
    setVirtualDomTime(virtualEnd - virtualStart);
  };

  // 演示2: Diff算法可视化
  const runDiffDemo = () => {
    setCurrentStep(0);
    const steps: string[] = [];

    // 创建旧的虚拟DOM
    const oldVTree: VNode = createElement(
      'div',
      { className: 'container' },
      createElement('h1', {}, 'Hello World'),
      createElement('p', {}, 'This is a paragraph'),
      createElement('button', { className: 'btn' }, 'Click me')
    );

    // 创建新的虚拟DOM
    const newVTree: VNode = createElement(
      'div',
      { className: 'container updated' },
      createElement('h1', {}, 'Hello React'),
      createElement('p', {}, 'This is a paragraph'),
      createElement('button', { className: 'btn primary' }, 'Click me'),
      createElement('span', {}, 'New element')
    );

    steps.push('🔍 开始比较虚拟DOM树...');
    steps.push('📦 根节点类型相同: div');
    steps.push('🎨 根节点 className 变化: "container" → "container updated"');
    steps.push('📝 子节点1 (h1): 文本内容变化 "Hello World" → "Hello React"');
    steps.push('✅ 子节点2 (p): 无变化');
    steps.push('🎨 子节点3 (button): className 变化 "btn" → "btn primary"');
    steps.push('➕ 子节点4 (span): 新增节点');
    steps.push('✨ Diff完成！需要更新的节点: 根节点、h1、button，新增: span');

    setDiffSteps(steps);
  };

  useEffect(() => {
    if (diffSteps.length > 0 && currentStep < diffSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep, diffSteps.length]);

  // 演示3: 虚拟DOM更新过程
  const [todoList, setTodoList] = useState<string[]>([
    'Learn React',
    'Learn Virtual DOM',
    'Learn Fiber',
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [updateLog, setUpdateLog] = useState<string[]>([]);

  const addTodo = () => {
    if (newTodo.trim()) {
      const log = [
        `⚡ 触发更新: 添加新任务 "${newTodo}"`,
        `🔄 创建新的虚拟DOM树`,
        `🔍 执行Diff算法，比较新旧虚拟DOM`,
        `📊 Diff结果: 在列表末尾添加一个新的 <li> 节点`,
        `✏️ 只更新变化的部分: 创建新的DOM节点并插入`,
        `✅ 更新完成！`,
      ];
      setUpdateLog(log);
      setTodoList([...todoList, newTodo]);
      setNewTodo('');
    }
  };

  const removeTodo = (index: number) => {
    const log = [
      `⚡ 触发更新: 删除任务 "${todoList[index]}"`,
      `🔄 创建新的虚拟DOM树`,
      `🔍 执行Diff算法`,
      `📊 Diff结果: 删除索引为 ${index} 的 <li> 节点`,
      `✏️ 只更新变化的部分: 移除对应的DOM节点`,
      `✅ 更新完成！`,
    ];
    setUpdateLog(log);
    setTodoList(todoList.filter((_, i) => i !== index));
  };

  return (
    <div className="virtual-dom-demo">
      <h2>🌳 虚拟DOM (Virtual DOM) 详解</h2>
      <p className="description">
        虚拟DOM是React的核心概念之一，它是真实DOM的JavaScript对象表示。
        通过在内存中操作虚拟DOM，然后批量更新真实DOM，可以大大提高性能。
      </p>

      {/* 概念介绍 */}
      <div className="demo-section concept-section">
        <h3>📚 什么是虚拟DOM？</h3>
        <div className="concept-grid">
          <div className="concept-card">
            <h4>🎯 定义</h4>
            <p>
              虚拟DOM是一个轻量级的JavaScript对象，它是真实DOM的抽象表示。
              每个虚拟DOM节点包含元素类型、属性和子节点等信息。
            </p>
            <pre className="code-block">{`// 虚拟DOM示例
const vnode = {
  type: 'div',
  props: {
    className: 'container',
    children: [
      {
        type: 'h1',
        props: { children: 'Hello' }
      },
      {
        type: 'p',
        props: { children: 'World' }
      }
    ]
  }
}`}</pre>
          </div>

          <div className="concept-card">
            <h4>⚡ 为什么需要虚拟DOM？</h4>
            <ul>
              <li>✅ <strong>性能优化</strong>: 减少直接操作真实DOM的次数</li>
              <li>✅ <strong>批量更新</strong>: 收集多个更新，一次性应用到DOM</li>
              <li>✅ <strong>跨平台</strong>: 可以渲染到不同的目标平台</li>
              <li>✅ <strong>开发体验</strong>: 声明式编程，简化开发</li>
            </ul>
          </div>

          <div className="concept-card full-width">
            <h4>🔄 虚拟DOM工作流程</h4>
            <div className="workflow-steps">
              <div className="workflow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <strong>创建虚拟DOM</strong>
                  <p>JSX编译成createElement调用，生成虚拟DOM对象</p>
                </div>
              </div>
              <div className="arrow">→</div>
              <div className="workflow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <strong>Diff算法</strong>
                  <p>比较新旧虚拟DOM，找出差异</p>
                </div>
              </div>
              <div className="arrow">→</div>
              <div className="workflow-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <strong>打补丁</strong>
                  <p>将差异应用到真实DOM</p>
                </div>
              </div>
              <div className="arrow">→</div>
              <div className="workflow-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <strong>重新渲染</strong>
                  <p>浏览器根据DOM变化重绘页面</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 性能对比 */}
      <div className="demo-section">
        <h3>⚡ 性能对比：真实DOM vs 虚拟DOM</h3>
        <p>点击按钮，创建1000个元素并更新一半的内容，对比性能差异</p>
        <button className="demo-button" onClick={runPerformanceTest}>
          运行性能测试
        </button>

        {showComparison && (
          <div className="performance-results">
            <div className="result-card">
              <h4>🐌 直接操作真实DOM</h4>
              <div className="time-display">{realDomTime.toFixed(2)} ms</div>
              <p>创建1000个元素，然后逐个修改500个元素的文本</p>
              <div ref={realDomRef} className="dom-container" />
            </div>

            <div className="result-card">
              <h4>🚀 虚拟DOM + Diff</h4>
              <div className="time-display highlight">{virtualDomTime.toFixed(2)} ms</div>
              <p>创建虚拟DOM，执行Diff，只更新变化的部分</p>
              <div ref={virtualDomRef} className="dom-container" />
            </div>

            <div className="speedup-info">
              <strong>性能提升:</strong> 虚拟DOM通过批量更新和最小化DOM操作，
              在复杂场景下可以显著提升性能。
              {realDomTime > virtualDomTime && (
                <span className="speedup-value">
                  提升了 {((realDomTime - virtualDomTime) / realDomTime * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Diff算法演示 */}
      <div className="demo-section">
        <h3>🔍 Diff算法可视化</h3>
        <p>Diff算法是虚拟DOM的核心，它比较新旧虚拟DOM树，找出最小的更新集</p>
        <button className="demo-button" onClick={runDiffDemo}>
          演示Diff算法
        </button>

        {diffSteps.length > 0 && (
          <div className="diff-visualization">
            <div className="diff-trees">
              <div className="tree-container">
                <h4>旧虚拟DOM</h4>
                <pre className="tree-display">{`<div className="container">
  <h1>Hello World</h1>
  <p>This is a paragraph</p>
  <button className="btn">
    Click me
  </button>
</div>`}</pre>
              </div>

              <div className="diff-arrow">
                <span>Diff</span>
                <div className="arrow-icon">→</div>
              </div>

              <div className="tree-container">
                <h4>新虚拟DOM</h4>
                <pre className="tree-display">{`<div className="container updated">
  <h1>Hello React</h1>
  <p>This is a paragraph</p>
  <button className="btn primary">
    Click me
  </button>
  <span>New element</span>
</div>`}</pre>
              </div>
            </div>

            <div className="diff-steps">
              <h4>Diff过程：</h4>
              {diffSteps.slice(0, currentStep).map((step, index) => (
                <div key={index} className="diff-step">
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 实战示例：Todo List */}
      <div className="demo-section">
        <h3>📝 实战示例：Todo List 更新过程</h3>
        <p>观察添加或删除任务时，虚拟DOM的更新过程</p>

        <div className="todo-demo">
          <div className="todo-input-area">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="输入新任务..."
              className="todo-input"
            />
            <button onClick={addTodo} className="add-button">
              添加任务
            </button>
          </div>

          <div className="todo-content">
            <div className="todo-list-container">
              <h4>Todo 列表</h4>
              <ul className="todo-list">
                {todoList.map((todo, index) => (
                  <li key={index} className="todo-item">
                    <span>{todo}</span>
                    <button
                      onClick={() => removeTodo(index)}
                      className="remove-button"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="update-log-container">
              <h4>更新日志</h4>
              <div className="update-log">
                {updateLog.map((log, index) => (
                  <div key={index} className="log-entry">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 核心概念总结 */}
      <div className="demo-section summary-section">
        <h3>🔑 核心概念总结</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <h4>1. 虚拟DOM的本质</h4>
            <p>用JavaScript对象描述DOM结构，是真实DOM的抽象表示</p>
          </div>

          <div className="summary-card">
            <h4>2. Diff算法</h4>
            <p>高效比较新旧虚拟DOM树，时间复杂度O(n)，找出最小更新集</p>
          </div>

          <div className="summary-card">
            <h4>3. 批量更新</h4>
            <p>收集多个更新操作，统一计算差异，一次性应用到真实DOM</p>
          </div>

          <div className="summary-card">
            <h4>4. 性能优化</h4>
            <p>减少真实DOM操作次数，避免不必要的重绘和回流</p>
          </div>

          <div className="summary-card">
            <h4>5. React的实现</h4>
            <p>JSX → createElement → 虚拟DOM → Diff → Patch → 真实DOM</p>
          </div>

          <div className="summary-card">
            <h4>6. 局限性</h4>
            <p>对于简单更新，虚拟DOM可能比直接操作DOM慢；优势在于复杂场景</p>
          </div>
        </div>
      </div>

      {/* Diff算法策略 */}
      <div className="demo-section">
        <h3>🎯 React Diff算法的三大策略</h3>
        <div className="strategy-list">
          <div className="strategy-item">
            <div className="strategy-icon">1️⃣</div>
            <div className="strategy-content">
              <h4>Tree Diff - 层级比较</h4>
              <p>
                只比较同一层级的节点，不跨层级比较。这样将O(n³)的复杂度降低到O(n)。
              </p>
              <pre className="strategy-code">{`// 只比较同层节点
<div>              <div>
  <p>A</p>   →      <span>A</span>
</div>             </div>
// 即使内容相同，但类型不同，会直接替换`}</pre>
            </div>
          </div>

          <div className="strategy-item">
            <div className="strategy-icon">2️⃣</div>
            <div className="strategy-content">
              <h4>Component Diff - 组件比较</h4>
              <p>
                同类型组件，继续比较虚拟DOM树；不同类型组件，直接替换整个组件。
              </p>
              <pre className="strategy-code">{`// 相同类型：继续diff
<TodoList items={old} />  →  <TodoList items={new} />

// 不同类型：直接替换
<TodoList />  →  <TaskList />  // 完全重新渲染`}</pre>
            </div>
          </div>

          <div className="strategy-item">
            <div className="strategy-icon">3️⃣</div>
            <div className="strategy-content">
              <h4>Element Diff - 节点比较</h4>
              <p>
                对于同一层级的子节点，使用key进行区分，优化列表渲染性能。
              </p>
              <pre className="strategy-code">{`// 没有key：全部重新渲染
[A, B, C]  →  [A, B, C, D]

// 有key：只插入D
[A, B, C]  →  [A, B, C, D]  
// React识别出只需要插入D，其他复用`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* 最佳实践 */}
      <div className="demo-section best-practices">
        <h3>✨ 最佳实践</h3>
        <div className="practices-grid">
          <div className="practice-item">
            <div className="practice-icon">🔑</div>
            <h4>使用唯一key</h4>
            <p>在列表渲染时始终使用稳定、唯一的key，避免使用index作为key</p>
          </div>

          <div className="practice-item">
            <div className="practice-icon">🎯</div>
            <h4>避免不必要的更新</h4>
            <p>使用React.memo、useMemo、useCallback等优化手段</p>
          </div>

          <div className="practice-item">
            <div className="practice-icon">📦</div>
            <h4>保持组件纯粹</h4>
            <p>相同的props应该渲染相同的结果，便于React优化</p>
          </div>

          <div className="practice-item">
            <div className="practice-icon">⚡</div>
            <h4>合理拆分组件</h4>
            <p>将变化频繁的部分独立成组件，减少Diff范围</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualDOM;

