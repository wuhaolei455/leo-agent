import React, { useState } from 'react';

const EventLoopBasics: React.FC = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDemo1 = () => {
    setIsRunning(true);
    setOutput([]);
    const logs: string[] = [];

    // 添加日志函数
    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    log('1. 开始执行');
    
    setTimeout(() => {
      log('4. setTimeout回调执行');
      setIsRunning(false);
    }, 0);
    
    log('2. 同步代码继续执行');
    log('3. 同步代码执行完毕');
  };

  const runDemo2 = () => {
    setIsRunning(true);
    setOutput([]);
    const logs: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    log('Start');
    
    setTimeout(() => {
      log('Timeout 1');
    }, 0);
    
    Promise.resolve().then(() => {
      log('Promise 1');
    });
    
    setTimeout(() => {
      log('Timeout 2');
      setIsRunning(false);
    }, 0);
    
    Promise.resolve().then(() => {
      log('Promise 2');
    });
    
    log('End');
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1 className="demo-title">🔄 事件循环基础</h1>
        <p className="demo-subtitle">
          理解JavaScript的单线程执行模型和事件循环机制
        </p>
      </div>

      <div className="demo-section">
        <h2 className="section-title">📖 什么是事件循环？</h2>
        <div className="section-content">
          <p>
            <strong>事件循环（Event Loop）</strong>是JavaScript运行时的核心机制，它协调代码的执行、事件的处理和任务的调度。
          </p>
          <p>
            JavaScript是<strong>单线程</strong>语言，意味着同一时间只能执行一个任务。但通过事件循环机制，JavaScript可以处理异步操作，避免阻塞主线程。
          </p>
          
          <div className="info-box">
            <strong>核心组成部分：</strong>
            <ul>
              <li><strong>调用栈（Call Stack）</strong> - 存储当前正在执行的函数</li>
              <li><strong>任务队列（Task Queue）</strong> - 存储待执行的回调函数</li>
              <li><strong>事件循环（Event Loop）</strong> - 不断检查栈和队列的状态</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">🎯 执行流程</h2>
        <div className="section-content">
          <div className="highlight-box">
            <ol style={{ lineHeight: '2' }}>
              <li>执行栈中的<strong>同步代码</strong>依次执行</li>
              <li>遇到<strong>异步操作</strong>（如setTimeout、Promise），将其回调放入相应的任务队列</li>
              <li>当执行栈<strong>清空</strong>后，事件循环开始工作</li>
              <li>首先检查<strong>微任务队列</strong>，执行所有微任务</li>
              <li>然后从<strong>宏任务队列</strong>取出一个任务执行</li>
              <li>重复步骤4-5，直到所有任务完成</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">💻 示例1：基础异步执行</h2>
        <div className="section-content">
          <p>这个例子展示了同步代码和异步代码的执行顺序：</p>
          
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`console.log('1. 开始执行');

setTimeout(() => {
  console.log('4. setTimeout回调执行');
}, 0);

console.log('2. 同步代码继续执行');
console.log('3. 同步代码执行完毕');

// 输出顺序：1 → 2 → 3 → 4`}</code></pre>
          </div>

          <div className="info-box warning">
            <strong>⚠️ 重要：</strong>即使setTimeout的延迟设置为0，它的回调也会在所有同步代码执行完毕后才执行。
          </div>

          <div className="interactive-demo">
            <button 
              className="demo-button" 
              onClick={runDemo1}
              disabled={isRunning}
            >
              运行示例1
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
        <h2 className="section-title">💻 示例2：Promise vs setTimeout</h2>
        <div className="section-content">
          <p>这个例子展示了微任务（Promise）和宏任务（setTimeout）的执行顺序：</p>
          
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`console.log('Start');

setTimeout(() => {
  console.log('Timeout 1');
}, 0);

Promise.resolve().then(() => {
  console.log('Promise 1');
});

setTimeout(() => {
  console.log('Timeout 2');
}, 0);

Promise.resolve().then(() => {
  console.log('Promise 2');
});

console.log('End');

// 输出顺序：Start → End → Promise 1 → Promise 2 → Timeout 1 → Timeout 2`}</code></pre>
          </div>

          <div className="info-box">
            <strong>✨ 关键点：</strong>
            <ul>
              <li>同步代码最先执行：Start → End</li>
              <li>微任务（Promise）在宏任务（setTimeout）之前执行</li>
              <li>所有微任务执行完后，才会执行下一个宏任务</li>
            </ul>
          </div>

          <div className="interactive-demo">
            <button 
              className="demo-button" 
              onClick={runDemo2}
              disabled={isRunning}
            >
              运行示例2
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
        <h2 className="section-title">🎨 可视化理解</h2>
        <div className="section-content">
          <div className="visualization">
            <pre style={{ background: '#f8f9fa', color: '#2c3e50' }}>
{`执行过程：

1️⃣ 同步代码阶段
   Call Stack: [main] → 执行 console.log('Start')
   Call Stack: [main] → 遇到 setTimeout，加入宏任务队列
   Call Stack: [main] → 遇到 Promise，加入微任务队列
   Call Stack: [main] → 执行 console.log('End')
   Call Stack: [] → 同步代码执行完毕

2️⃣ 微任务阶段
   Microtask Queue: [Promise 1, Promise 2]
   执行所有微任务 → Promise 1 → Promise 2

3️⃣ 宏任务阶段
   Macrotask Queue: [Timeout 1, Timeout 2]
   取出一个执行 → Timeout 1
   再取出一个执行 → Timeout 2`}
            </pre>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">🔑 核心要点</h2>
        <div className="section-content">
          <div className="highlight-box">
            <ul style={{ lineHeight: '2' }}>
              <li>✅ JavaScript是<strong>单线程</strong>的，同一时间只能执行一个任务</li>
              <li>✅ 事件循环负责协调<strong>同步代码</strong>和<strong>异步回调</strong>的执行</li>
              <li>✅ <strong>微任务</strong>优先级高于<strong>宏任务</strong></li>
              <li>✅ 每次事件循环都会先清空<strong>所有微任务</strong>，再执行<strong>一个宏任务</strong></li>
              <li>✅ 理解事件循环是掌握JavaScript异步编程的基础</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventLoopBasics;

