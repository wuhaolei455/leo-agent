import React, { useState } from 'react';

const MacroVsMicro: React.FC = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [macroTasks, setMacroTasks] = useState<string[]>([]);
  const [microTasks, setMicroTasks] = useState<string[]>([]);

  const runComplexDemo = async () => {
    setOutput([]);
    setMacroTasks([]);
    setMicroTasks([]);
    
    const logs: string[] = [];
    const macros: string[] = [];
    const micros: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    const addMacro = (task: string) => {
      macros.push(task);
      setMacroTasks([...macros]);
    };

    const addMicro = (task: string) => {
      micros.push(task);
      setMicroTasks([...micros]);
    };

    log('🚀 程序开始');

    setTimeout(() => {
      log('⏰ setTimeout 1');
    }, 0);
    addMacro('setTimeout 1');

    Promise.resolve().then(() => {
      log('✨ Promise 1');
      
      setTimeout(() => {
        log('⏰ setTimeout 3 (在Promise 1中)');
      }, 0);
      
      return Promise.resolve();
    }).then(() => {
      log('✨ Promise 2');
    });
    addMicro('Promise 1 → Promise 2');

    setTimeout(() => {
      log('⏰ setTimeout 2');
      
      Promise.resolve().then(() => {
        log('✨ Promise 3 (在setTimeout 2中)');
      });
    }, 0);
    addMacro('setTimeout 2');

    log('🏁 同步代码结束');
  };

  const runNestedDemo = () => {
    setOutput([]);
    const logs: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    log('Start');

    setTimeout(() => {
      log('Timeout 1');
      
      Promise.resolve().then(() => {
        log('Promise in Timeout 1');
      });
      
      setTimeout(() => {
        log('Timeout nested in Timeout 1');
      }, 0);
    }, 0);

    Promise.resolve()
      .then(() => {
        log('Promise 1');
        return Promise.resolve();
      })
      .then(() => {
        log('Promise 2');
      });

    log('End');
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1 className="demo-title">⚖️ 宏任务 vs 微任务</h1>
        <p className="demo-subtitle">
          深入理解JavaScript任务队列的优先级机制
        </p>
      </div>

      <div className="demo-section">
        <h2 className="section-title">📖 什么是宏任务和微任务？</h2>
        <div className="section-content">
          <p>
            在JavaScript事件循环中，异步任务被分为两类：<strong>宏任务（Macrotask）</strong>和<strong>微任务（Microtask）</strong>。
            它们有不同的优先级和执行时机。
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div className="info-box error">
              <h3 style={{ marginBottom: '12px' }}>🔴 宏任务（Macrotask）</h3>
              <ul style={{ lineHeight: '1.8' }}>
                <li>setTimeout</li>
                <li>setInterval</li>
                <li>setImmediate (Node.js)</li>
                <li>I/O 操作</li>
                <li>UI 渲染</li>
                <li>requestAnimationFrame</li>
              </ul>
            </div>
            
            <div className="info-box">
              <h3 style={{ marginBottom: '12px' }}>🔵 微任务（Microtask）</h3>
              <ul style={{ lineHeight: '1.8' }}>
                <li>Promise.then/catch/finally</li>
                <li>async/await</li>
                <li>queueMicrotask()</li>
                <li>MutationObserver</li>
                <li>process.nextTick (Node.js)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">🎯 执行优先级</h2>
        <div className="section-content">
          <div className="highlight-box">
            <h3 style={{ marginBottom: '16px', color: '#667eea' }}>事件循环的完整执行流程：</h3>
            <ol style={{ lineHeight: '2' }}>
              <li>执行<strong>同步代码</strong>（调用栈中的任务）</li>
              <li>执行<strong>所有微任务</strong>（清空微任务队列）
                <ul style={{ marginTop: '8px', color: '#666' }}>
                  <li>如果微任务中产生新的微任务，继续执行</li>
                  <li>直到微任务队列完全清空</li>
                </ul>
              </li>
              <li>执行<strong>一个宏任务</strong>（从宏任务队列取出一个）</li>
              <li>再次执行<strong>所有微任务</strong></li>
              <li>重复步骤3-4，直到所有任务完成</li>
            </ol>
          </div>

          <div className="info-box warning">
            <strong>⚠️ 关键点：</strong>
            <ul>
              <li>微任务的优先级<strong>高于</strong>宏任务</li>
              <li>每执行完一个宏任务，都会清空<strong>所有</strong>微任务</li>
              <li>微任务可以插队到宏任务之前执行</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">💻 复杂示例：嵌套的宏任务和微任务</h2>
        <div className="section-content">
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`console.log('🚀 程序开始');

setTimeout(() => {
  console.log('⏰ setTimeout 1');
}, 0);

Promise.resolve().then(() => {
  console.log('✨ Promise 1');
  
  setTimeout(() => {
    console.log('⏰ setTimeout 3 (在Promise 1中)');
  }, 0);
  
  return Promise.resolve();
}).then(() => {
  console.log('✨ Promise 2');
});

setTimeout(() => {
  console.log('⏰ setTimeout 2');
  
  Promise.resolve().then(() => {
    console.log('✨ Promise 3 (在setTimeout 2中)');
  });
}, 0);

console.log('🏁 同步代码结束');`}</code></pre>
          </div>

          <div className="interactive-demo">
            <button className="demo-button" onClick={runComplexDemo}>
              运行复杂示例
            </button>
            
            {output.length > 0 && (
              <>
                <div className="queue-container">
                  <div className="queue">
                    <div className="queue-title">🔴 宏任务队列</div>
                    {macroTasks.map((task, index) => (
                      <div key={index} className="task-item macro">
                        {task}
                      </div>
                    ))}
                  </div>
                  <div className="queue">
                    <div className="queue-title">🔵 微任务队列</div>
                    {microTasks.map((task, index) => (
                      <div key={index} className="task-item micro">
                        {task}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="output-display">
                  <h4 style={{ marginBottom: '10px' }}>执行顺序：</h4>
                  {output.map((line, index) => (
                    <div key={index} className="output-line">
                      {index + 1}. {line}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="visualization" style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>📊 执行过程分析</h3>
            <pre style={{ background: '#f8f9fa', color: '#2c3e50', fontSize: '14px' }}>
{`第1轮事件循环：
├─ 同步代码：程序开始 → 同步代码结束
├─ 微任务：Promise 1 → Promise 2
└─ 宏任务：setTimeout 1

第2轮事件循环：
├─ 宏任务：setTimeout 2
└─ 微任务：Promise 3

第3轮事件循环：
└─ 宏任务：setTimeout 3

💡 关键观察：
   • Promise 1/2 在 setTimeout 1 之前执行（微任务优先）
   • setTimeout 2 执行后，立即执行其中的 Promise 3
   • setTimeout 3 虽然在 Promise 1 中创建，但要等前面的宏任务执行完`}
            </pre>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">💻 嵌套任务示例</h2>
        <div className="section-content">
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`console.log('Start');

setTimeout(() => {
  console.log('Timeout 1');
  
  Promise.resolve().then(() => {
    console.log('Promise in Timeout 1');
  });
  
  setTimeout(() => {
    console.log('Timeout nested in Timeout 1');
  }, 0);
}, 0);

Promise.resolve()
  .then(() => {
    console.log('Promise 1');
    return Promise.resolve();
  })
  .then(() => {
    console.log('Promise 2');
  });

console.log('End');`}</code></pre>
          </div>

          <div className="interactive-demo">
            <button className="demo-button" onClick={runNestedDemo}>
              运行嵌套示例
            </button>
            
            {output.length > 0 && (
              <div className="output-display">
                <h4 style={{ marginBottom: '10px' }}>执行结果：</h4>
                {output.map((line, index) => (
                  <div key={index} className="output-line">
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">⚠️ 常见陷阱</h2>
        <div className="section-content">
          <div className="info-box error">
            <h3 style={{ marginBottom: '12px' }}>陷阱1：无限微任务</h3>
            <p>如果微任务中不断产生新的微任务，会导致宏任务永远无法执行：</p>
            <pre style={{ background: '#fff', marginTop: '12px' }}><code>{`// ❌ 危险代码 - 会造成死循环
function infiniteMicrotask() {
  Promise.resolve().then(() => {
    infiniteMicrotask(); // 不断创建新的微任务
  });
}
infiniteMicrotask(); // 宏任务将被饿死`}</code></pre>
          </div>

          <div className="info-box warning">
            <h3 style={{ marginBottom: '12px' }}>陷阱2：误解setTimeout(0)</h3>
            <p>setTimeout(fn, 0) 并不是立即执行，而是在下一个宏任务周期执行：</p>
            <pre style={{ background: '#fff', marginTop: '12px' }}><code>{`setTimeout(() => console.log('我不会立即执行'), 0);
Promise.resolve().then(() => console.log('我会先执行'));`}</code></pre>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">🔑 核心要点</h2>
        <div className="section-content">
          <div className="highlight-box">
            <ul style={{ lineHeight: '2' }}>
              <li>✅ <strong>微任务优先级</strong>高于宏任务</li>
              <li>✅ 每个宏任务执行完后，会<strong>清空所有微任务</strong></li>
              <li>✅ 微任务中产生的新微任务会在<strong>当前周期</strong>执行</li>
              <li>✅ 宏任务中产生的新微任务会在<strong>该宏任务结束后</strong>立即执行</li>
              <li>✅ 理解任务优先级对于编写高性能代码至关重要</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroVsMicro;

