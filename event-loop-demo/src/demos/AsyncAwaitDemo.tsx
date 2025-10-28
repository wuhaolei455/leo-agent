import React, { useState } from 'react';

const AsyncAwaitDemo: React.FC = () => {
  const [output, setOutput] = useState<string[]>([]);

  const runBasicAsync = async () => {
    setOutput([]);
    const logs: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    log('1. 开始');

    async function asyncFunc() {
      log('2. async函数开始');
      const result = await Promise.resolve('Hello');
      log('4. await之后');
      return result;
    }

    asyncFunc().then((result) => {
      log(`5. 函数返回: ${result}`);
    });

    log('3. async函数调用后');
  };

  const runAsyncTiming = async () => {
    setOutput([]);
    const logs: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    log('Start');

    setTimeout(() => {
      log('Timeout');
    }, 0);

    async function test() {
      log('Async 1');
      await Promise.resolve();
      log('Async 2');
      await Promise.resolve();
      log('Async 3');
    }

    test();

    Promise.resolve().then(() => {
      log('Promise 1');
    });

    log('End');
  };

  const runAsyncSequential = async () => {
    setOutput([]);
    const logs: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    log('开始顺序执行');
    
    const start = Date.now();
    
    await delay(100);
    log(`任务1完成 (${Date.now() - start}ms)`);
    
    await delay(100);
    log(`任务2完成 (${Date.now() - start}ms)`);
    
    await delay(100);
    log(`任务3完成 (${Date.now() - start}ms)`);
    
    log(`总耗时: ${Date.now() - start}ms (约300ms)`);
  };

  const runAsyncParallel = async () => {
    setOutput([]);
    const logs: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    log('开始并行执行');
    
    const start = Date.now();
    
    // 并行执行
    await Promise.all([
      delay(100).then(() => log(`任务1完成 (${Date.now() - start}ms)`)),
      delay(100).then(() => log(`任务2完成 (${Date.now() - start}ms)`)),
      delay(100).then(() => log(`任务3完成 (${Date.now() - start}ms)`))
    ]);
    
    log(`总耗时: ${Date.now() - start}ms (约100ms)`);
  };

  const runErrorHandling = async () => {
    setOutput([]);
    const logs: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    async function fetchData() {
      log('开始获取数据');
      throw new Error('网络错误');
    }

    try {
      await fetchData();
      log('成功获取数据');
    } catch (error: any) {
      log(`捕获错误: ${error.message}`);
    } finally {
      log('清理资源');
    }

    log('继续执行');
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1 className="demo-title">⏳ Async/Await</h1>
        <p className="demo-subtitle">
          现代JavaScript异步编程的最佳实践
        </p>
      </div>

      <div className="demo-section">
        <h2 className="section-title">📖 什么是Async/Await？</h2>
        <div className="section-content">
          <p>
            <strong>Async/Await</strong>是基于Promise的语法糖，让异步代码看起来像同步代码，更容易理解和维护。
          </p>
          
          <div className="info-box">
            <h3 style={{ marginBottom: '12px' }}>基本概念</h3>
            <ul style={{ lineHeight: '1.8' }}>
              <li><strong>async</strong>关键字用于声明异步函数，它会自动返回一个Promise</li>
              <li><strong>await</strong>关键字只能在async函数内使用，用于等待Promise resolve</li>
              <li>async/await本质上是Promise的<strong>语法糖</strong></li>
              <li>await会暂停函数执行，但<strong>不会阻塞主线程</strong></li>
            </ul>
          </div>

          <div className="highlight-box">
            <h3 style={{ marginBottom: '12px', color: '#667eea' }}>Promise vs Async/Await对比</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <strong>使用Promise：</strong>
                <pre style={{ background: '#fff', marginTop: '8px' }}><code>{`fetchUser()
  .then(user => {
    return fetchPosts(user.id);
  })
  .then(posts => {
    return fetchComments(posts);
  })
  .then(comments => {
    console.log(comments);
  })
  .catch(error => {
    console.error(error);
  });`}</code></pre>
              </div>
              <div>
                <strong>使用Async/Await：</strong>
                <pre style={{ background: '#fff', marginTop: '8px' }}><code>{`try {
  const user = await fetchUser();
  const posts = await fetchPosts(user.id);
  const comments = await fetchComments(posts);
  console.log(comments);
} catch (error) {
  console.error(error);
}`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">💻 基础示例：Async函数执行时机</h2>
        <div className="section-content">
          <p>理解async函数和await的执行时机：</p>
          
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`console.log('1. 开始');

async function asyncFunc() {
  console.log('2. async函数开始');
  const result = await Promise.resolve('Hello');
  console.log('4. await之后');
  return result;
}

asyncFunc().then((result) => {
  console.log(\`5. 函数返回: \${result}\`);
});

console.log('3. async函数调用后');`}</code></pre>
          </div>

          <div className="info-box">
            <strong>✨ 执行分析：</strong>
            <ul>
              <li>async函数在<strong>await之前</strong>的代码是同步执行的</li>
              <li><strong>await</strong>会暂停函数执行，后续代码变成微任务</li>
              <li>async函数外的同步代码继续执行</li>
              <li>微任务在同步代码执行完后执行</li>
            </ul>
          </div>

          <div className="interactive-demo">
            <button className="demo-button" onClick={runBasicAsync}>
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
        <h2 className="section-title">💻 Async/Await与事件循环</h2>
        <div className="section-content">
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`console.log('Start');

setTimeout(() => {
  console.log('Timeout');
}, 0);

async function test() {
  console.log('Async 1');
  await Promise.resolve();
  console.log('Async 2');
  await Promise.resolve();
  console.log('Async 3');
}

test();

Promise.resolve().then(() => {
  console.log('Promise 1');
});

console.log('End');`}</code></pre>
          </div>

          <div className="visualization">
            <h3 style={{ marginBottom: '16px' }}>执行过程分析</h3>
            <pre style={{ background: '#f8f9fa', color: '#2c3e50', fontSize: '14px' }}>
{`同步代码：
  Start → Async 1 → End

微任务队列（按顺序执行）：
  await后续代码 → Promise 1 → Async 2 → Async 3

宏任务队列：
  Timeout

关键点：
• async函数在await之前同步执行
• 每个await都会创建一个微任务
• 微任务优先于宏任务执行`}
            </pre>
          </div>

          <div className="interactive-demo">
            <button className="demo-button" onClick={runAsyncTiming}>
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
        <h2 className="section-title">💻 顺序执行 vs 并行执行</h2>
        <div className="section-content">
          <p>理解何时使用顺序执行，何时使用并行执行：</p>
          
          <div className="highlight-box">
            <h3 style={{ marginBottom: '12px', color: '#667eea' }}>顺序执行（Sequential）</h3>
            <p>当任务之间有依赖关系时使用：</p>
            <pre style={{ background: '#fff', marginTop: '8px' }}><code>{`// 顺序执行：总耗时 = 100 + 100 + 100 = 300ms
await delay(100); // 等待100ms
await delay(100); // 再等待100ms
await delay(100); // 再等待100ms`}</code></pre>
          </div>

          <div className="highlight-box">
            <h3 style={{ marginBottom: '12px', color: '#667eea' }}>并行执行（Parallel）</h3>
            <p>当任务之间相互独立时使用：</p>
            <pre style={{ background: '#fff', marginTop: '8px' }}><code>{`// 并行执行：总耗时 = 100ms（同时进行）
await Promise.all([
  delay(100),
  delay(100),
  delay(100)
]);`}</code></pre>
          </div>

          <div className="demo-controls">
            <button className="demo-button" onClick={runAsyncSequential}>
              运行顺序执行（~300ms）
            </button>
            <button className="demo-button" onClick={runAsyncParallel}>
              运行并行执行（~100ms）
            </button>
          </div>

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

      <div className="demo-section">
        <h2 className="section-title">💻 错误处理</h2>
        <div className="section-content">
          <p>Async/Await让错误处理更加直观，可以使用try/catch：</p>
          
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`async function fetchData() {
  console.log('开始获取数据');
  throw new Error('网络错误');
}

try {
  await fetchData();
  console.log('成功获取数据');
} catch (error) {
  console.log(\`捕获错误: \${error.message}\`);
} finally {
  console.log('清理资源');
}

console.log('继续执行');`}</code></pre>
          </div>

          <div className="info-box success">
            <strong>✅ 错误处理最佳实践：</strong>
            <ul>
              <li>使用try/catch捕获await的错误</li>
              <li>使用finally进行资源清理</li>
              <li>可以在顶层添加统一的错误处理</li>
              <li>注意Promise.all中任何一个失败都会reject</li>
            </ul>
          </div>

          <div className="interactive-demo">
            <button className="demo-button" onClick={runErrorHandling}>
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
            <h3 style={{ marginBottom: '12px' }}>陷阱1：忘记await</h3>
            <pre style={{ background: '#fff', marginTop: '12px' }}><code>{`// ❌ 错误：忘记await
async function bad() {
  const data = fetchData(); // 返回Promise对象，不是数据
  console.log(data); // Promise { <pending> }
}

// ✅ 正确
async function good() {
  const data = await fetchData();
  console.log(data); // 实际的数据
}`}</code></pre>
          </div>

          <div className="info-box warning">
            <h3 style={{ marginBottom: '12px' }}>陷阱2：在循环中使用await</h3>
            <pre style={{ background: '#fff', marginTop: '12px' }}><code>{`// ❌ 顺序执行（慢）
for (const item of items) {
  await processItem(item); // 每次等待
}

// ✅ 并行执行（快）
await Promise.all(items.map(item => processItem(item)));`}</code></pre>
          </div>

          <div className="info-box error">
            <h3 style={{ marginBottom: '12px' }}>陷阱3：在非async函数中使用await</h3>
            <pre style={{ background: '#fff', marginTop: '12px' }}><code>{`// ❌ 语法错误
function bad() {
  await fetchData(); // SyntaxError
}

// ✅ 正确
async function good() {
  await fetchData();
}

// ✅ 或者使用顶层await（模块中）
const data = await fetchData();`}</code></pre>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">🔑 核心要点</h2>
        <div className="section-content">
          <div className="highlight-box">
            <ul style={{ lineHeight: '2' }}>
              <li>✅ Async/Await是Promise的<strong>语法糖</strong>，让异步代码更易读</li>
              <li>✅ async函数总是返回<strong>Promise</strong></li>
              <li>✅ await会暂停函数执行，但<strong>不阻塞主线程</strong></li>
              <li>✅ await后的代码会变成<strong>微任务</strong></li>
              <li>✅ 使用Promise.all实现<strong>并行</strong>执行</li>
              <li>✅ 使用try/catch处理<strong>错误</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsyncAwaitDemo;

