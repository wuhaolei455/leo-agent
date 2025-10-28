import React, { useState } from 'react';

const PromiseDemo: React.FC = () => {
  const [output, setOutput] = useState<string[]>([]);

  const runBasicPromise = () => {
    setOutput([]);
    const logs: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    log('开始');

    const promise = new Promise((resolve) => {
      log('Promise executor 同步执行');
      resolve('resolved');
    });

    promise.then((value) => {
      log(`Promise.then: ${value}`);
    });

    log('结束');
  };

  const runPromiseChain = () => {
    setOutput([]);
    const logs: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    log('Start');

    Promise.resolve(1)
      .then((value) => {
        log(`第1个then: ${value}`);
        return value + 1;
      })
      .then((value) => {
        log(`第2个then: ${value}`);
        return value + 1;
      })
      .then((value) => {
        log(`第3个then: ${value}`);
      });

    log('End');
  };

  const runPromiseTiming = () => {
    setOutput([]);
    const logs: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    log('1. 脚本开始');

    setTimeout(() => {
      log('5. setTimeout');
    }, 0);

    new Promise((resolve) => {
      log('2. Promise executor');
      resolve(true);
    })
      .then(() => {
        log('4. Promise.then 1');
        return Promise.resolve();
      })
      .then(() => {
        log('6. Promise.then 2');
      });

    log('3. 脚本结束');
  };

  const runPromiseError = () => {
    setOutput([]);
    const logs: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    Promise.resolve()
      .then(() => {
        log('then 1');
        throw new Error('故意抛出错误');
      })
      .then(() => {
        log('then 2 (不会执行)');
      })
      .catch((error) => {
        log(`catch: ${error.message}`);
        return 'recovered';
      })
      .then((value) => {
        log(`then 3: ${value}`);
      });
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1 className="demo-title">🎯 Promise详解</h1>
        <p className="demo-subtitle">
          深入理解Promise的工作原理和与事件循环的关系
        </p>
      </div>

      <div className="demo-section">
        <h2 className="section-title">📖 什么是Promise？</h2>
        <div className="section-content">
          <p>
            <strong>Promise</strong>是JavaScript中处理异步操作的一种解决方案，它代表了一个异步操作的最终完成（或失败）及其结果值。
          </p>
          
          <div className="info-box">
            <h3 style={{ marginBottom: '12px' }}>Promise的三种状态</h3>
            <ul style={{ lineHeight: '1.8' }}>
              <li><strong>Pending（进行中）</strong> - 初始状态，既没有被兑现，也没有被拒绝</li>
              <li><strong>Fulfilled（已兑现）</strong> - 操作成功完成</li>
              <li><strong>Rejected（已拒绝）</strong> - 操作失败</li>
            </ul>
          </div>

          <div className="visualization">
            <h3 style={{ marginBottom: '16px' }}>Promise状态流转图</h3>
            <pre style={{ background: '#f8f9fa', color: '#2c3e50' }}>
{`         ┌─────────────┐
         │   Pending   │
         │  （进行中）  │
         └──────┬──────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  Fulfilled  │   │  Rejected   │
│  （已兑现）  │   │  （已拒绝）  │
└─────────────┘   └─────────────┘
   .then()            .catch()
                      .then()`}
            </pre>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">💻 基础示例：Promise执行时机</h2>
        <div className="section-content">
          <p>Promise的executor函数是<strong>同步执行</strong>的，但.then()回调是<strong>异步</strong>的（微任务）：</p>
          
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`console.log('开始');

const promise = new Promise((resolve) => {
  console.log('Promise executor 同步执行');
  resolve('resolved');
});

promise.then((value) => {
  console.log(\`Promise.then: \${value}\`);
});

console.log('结束');

// 输出：开始 → Promise executor 同步执行 → 结束 → Promise.then: resolved`}</code></pre>
          </div>

          <div className="info-box">
            <strong>✨ 关键点：</strong>
            <ul>
              <li>Promise构造函数中的executor函数<strong>立即同步执行</strong></li>
              <li>.then()回调会被加入<strong>微任务队列</strong></li>
              <li>微任务在所有同步代码执行完毕后执行</li>
            </ul>
          </div>

          <div className="interactive-demo">
            <button className="demo-button" onClick={runBasicPromise}>
              运行基础示例
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
        <h2 className="section-title">💻 Promise链式调用</h2>
        <div className="section-content">
          <p>Promise支持链式调用，每个.then()都会返回一个新的Promise：</p>
          
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`console.log('Start');

Promise.resolve(1)
  .then((value) => {
    console.log(\`第1个then: \${value}\`); // 1
    return value + 1;
  })
  .then((value) => {
    console.log(\`第2个then: \${value}\`); // 2
    return value + 1;
  })
  .then((value) => {
    console.log(\`第3个then: \${value}\`); // 3
  });

console.log('End');`}</code></pre>
          </div>

          <div className="highlight-box">
            <h3 style={{ marginBottom: '12px', color: '#667eea' }}>链式调用的特点</h3>
            <ul style={{ lineHeight: '1.8' }}>
              <li>每个.then()返回一个<strong>新的Promise</strong></li>
              <li>如果.then()中返回一个值，下一个.then()会接收到这个值</li>
              <li>如果.then()中返回一个Promise，下一个.then()会等待这个Promise resolve</li>
              <li>所有.then()都是<strong>微任务</strong>，按顺序执行</li>
            </ul>
          </div>

          <div className="interactive-demo">
            <button className="demo-button" onClick={runPromiseChain}>
              运行链式调用示例
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
        <h2 className="section-title">💻 Promise与事件循环</h2>
        <div className="section-content">
          <p>这个例子展示了Promise、同步代码和setTimeout的执行顺序：</p>
          
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`console.log('1. 脚本开始');

setTimeout(() => {
  console.log('5. setTimeout');
}, 0);

new Promise((resolve) => {
  console.log('2. Promise executor');
  resolve(true);
})
  .then(() => {
    console.log('4. Promise.then 1');
    return Promise.resolve();
  })
  .then(() => {
    console.log('6. Promise.then 2');
  });

console.log('3. 脚本结束');`}</code></pre>
          </div>

          <div className="visualization">
            <h3 style={{ marginBottom: '16px' }}>执行过程分析</h3>
            <pre style={{ background: '#f8f9fa', color: '#2c3e50', fontSize: '14px' }}>
{`1️⃣ 同步代码执行
   └─ 脚本开始 → Promise executor → 脚本结束

2️⃣ 微任务队列（优先执行）
   └─ Promise.then 1 → Promise.then 2

3️⃣ 宏任务队列
   └─ setTimeout

关键观察：
• Promise executor 是同步代码
• Promise.then 是微任务，比 setTimeout 先执行
• 返回 Promise.resolve() 会创建新的微任务`}
            </pre>
          </div>

          <div className="interactive-demo">
            <button className="demo-button" onClick={runPromiseTiming}>
              运行执行顺序示例
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
        <h2 className="section-title">💻 错误处理</h2>
        <div className="section-content">
          <p>Promise提供了优雅的错误处理机制：</p>
          
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`Promise.resolve()
  .then(() => {
    console.log('then 1');
    throw new Error('故意抛出错误');
  })
  .then(() => {
    console.log('then 2 (不会执行)');
  })
  .catch((error) => {
    console.log(\`catch: \${error.message}\`);
    return 'recovered'; // 可以恢复Promise链
  })
  .then((value) => {
    console.log(\`then 3: \${value}\`);
  });`}</code></pre>
          </div>

          <div className="info-box success">
            <strong>✅ 错误处理最佳实践：</strong>
            <ul>
              <li>使用.catch()捕获Promise链中的错误</li>
              <li>.catch()可以恢复Promise链，返回值会传递给下一个.then()</li>
              <li>建议在Promise链的末尾添加.catch()</li>
              <li>如果不处理错误，可能导致"未捕获的Promise拒绝"</li>
            </ul>
          </div>

          <div className="interactive-demo">
            <button className="demo-button" onClick={runPromiseError}>
              运行错误处理示例
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
            <h3 style={{ marginBottom: '12px' }}>陷阱1：忘记返回Promise</h3>
            <pre style={{ background: '#fff', marginTop: '12px' }}><code>{`// ❌ 错误
promise.then(() => {
  doSomethingAsync(); // 忘记return，下一个then不会等待
}).then(() => {
  // 可能在doSomethingAsync完成前执行
});

// ✅ 正确
promise.then(() => {
  return doSomethingAsync(); // 返回Promise
}).then(() => {
  // 会等待doSomethingAsync完成
});`}</code></pre>
          </div>

          <div className="info-box warning">
            <h3 style={{ marginBottom: '12px' }}>陷阱2：在Promise executor中使用async</h3>
            <pre style={{ background: '#fff', marginTop: '12px' }}><code>{`// ❌ 不推荐
new Promise(async (resolve) => {
  await someAsyncOperation();
  resolve();
});

// ✅ 推荐
(async () => {
  await someAsyncOperation();
  // 或者直接使用 async 函数
})();`}</code></pre>
          </div>

          <div className="info-box error">
            <h3 style={{ marginBottom: '12px' }}>陷阱3：Promise链地狱</h3>
            <pre style={{ background: '#fff', marginTop: '12px' }}><code>{`// ❌ 嵌套地狱
promise.then(() => {
  return promise2.then(() => {
    return promise3.then(() => {
      // ...
    });
  });
});

// ✅ 扁平化
promise
  .then(() => promise2)
  .then(() => promise3)
  .then(() => {
    // ...
  });`}</code></pre>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">🔑 核心要点</h2>
        <div className="section-content">
          <div className="highlight-box">
            <ul style={{ lineHeight: '2' }}>
              <li>✅ Promise executor是<strong>同步</strong>执行的</li>
              <li>✅ .then()/.catch()/.finally()回调是<strong>微任务</strong></li>
              <li>✅ 微任务在当前同步代码执行完后、下一个宏任务前执行</li>
              <li>✅ Promise链可以优雅地处理异步操作序列</li>
              <li>✅ 始终处理Promise错误，避免未捕获的拒绝</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromiseDemo;

