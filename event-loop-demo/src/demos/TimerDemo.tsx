import React, { useState } from 'react';

const TimerDemo: React.FC = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [timerOutput, setTimerOutput] = useState<string[]>([]);

  const runSetTimeoutDemo = () => {
    setOutput([]);
    const logs: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    log('Start');

    setTimeout(() => {
      log('Timeout 0ms');
    }, 0);

    setTimeout(() => {
      log('Timeout 100ms');
    }, 100);

    setTimeout(() => {
      log('Timeout 50ms');
    }, 50);

    log('End');
  };

  const runNestedTimeout = () => {
    setOutput([]);
    const logs: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    log('Start');

    setTimeout(() => {
      log('Timeout 1');
      
      setTimeout(() => {
        log('Nested Timeout 2');
      }, 0);
      
      log('After nested setTimeout');
    }, 0);

    log('End');
  };

  const runSetIntervalDemo = () => {
    setTimerOutput([]);
    const logs: string[] = [];
    let count = 0;

    const log = (msg: string) => {
      logs.push(msg);
      setTimerOutput([...logs]);
    };

    log('setInterval 开始');

    const intervalId = setInterval(() => {
      count++;
      log(`第 ${count} 次执行`);
      
      if (count >= 5) {
        clearInterval(intervalId);
        log('setInterval 已清除');
      }
    }, 500);
  };

  const runMinimumDelay = () => {
    setOutput([]);
    const logs: string[] = [];

    const log = (msg: string) => {
      logs.push(msg);
      setOutput([...logs]);
    };

    const start = Date.now();

    log('测试最小延迟');

    setTimeout(() => {
      const elapsed = Date.now() - start;
      log(`setTimeout(0): 实际延迟 ${elapsed}ms`);
    }, 0);

    setTimeout(() => {
      const elapsed = Date.now() - start;
      log(`setTimeout(1): 实际延迟 ${elapsed}ms`);
    }, 1);

    // 阻塞主线程
    const blockEnd = Date.now() + 10;
    while (Date.now() < blockEnd) {
      // 忙等待
    }

    log(`同步代码阻塞了 10ms`);
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1 className="demo-title">⏰ 定时器机制</h1>
        <p className="demo-subtitle">
          深入理解setTimeout和setInterval的工作原理
        </p>
      </div>

      <div className="demo-section">
        <h2 className="section-title">📖 定时器基础</h2>
        <div className="section-content">
          <p>
            JavaScript提供了两个主要的定时器API：<strong>setTimeout</strong>和<strong>setInterval</strong>。
            它们都是<strong>宏任务</strong>，会在指定的延迟后将回调加入宏任务队列。
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div className="info-box">
              <h3 style={{ marginBottom: '12px' }}>⏱️ setTimeout</h3>
              <p><strong>语法：</strong></p>
              <pre style={{ background: '#fff', marginTop: '8px' }}><code>{`setTimeout(callback, delay)`}</code></pre>
              <ul style={{ lineHeight: '1.8', marginTop: '12px' }}>
                <li>在指定延迟后<strong>执行一次</strong>回调</li>
                <li>返回一个timer ID</li>
                <li>可用clearTimeout取消</li>
                <li>延迟是最小延迟，不保证准确</li>
              </ul>
            </div>
            
            <div className="info-box warning">
              <h3 style={{ marginBottom: '12px' }}>🔄 setInterval</h3>
              <p><strong>语法：</strong></p>
              <pre style={{ background: '#fff', marginTop: '8px' }}><code>{`setInterval(callback, delay)`}</code></pre>
              <ul style={{ lineHeight: '1.8', marginTop: '12px' }}>
                <li>每隔指定延迟<strong>重复执行</strong>回调</li>
                <li>返回一个interval ID</li>
                <li>必须用clearInterval停止</li>
                <li>可能出现任务堆积问题</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">💻 setTimeout执行顺序</h2>
        <div className="section-content">
          <p>多个setTimeout会按照延迟时间加入宏任务队列：</p>
          
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`console.log('Start');

setTimeout(() => {
  console.log('Timeout 0ms');
}, 0);

setTimeout(() => {
  console.log('Timeout 100ms');
}, 100);

setTimeout(() => {
  console.log('Timeout 50ms');
}, 50);

console.log('End');

// 输出：Start → End → Timeout 0ms → Timeout 50ms → Timeout 100ms`}</code></pre>
          </div>

          <div className="info-box">
            <strong>✨ 关键点：</strong>
            <ul>
              <li>同步代码最先执行</li>
              <li>定时器按<strong>延迟时间排序</strong>执行</li>
              <li>即使延迟为0，也会等同步代码执行完</li>
            </ul>
          </div>

          <div className="interactive-demo">
            <button className="demo-button" onClick={runSetTimeoutDemo}>
              运行setTimeout示例
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
        <h2 className="section-title">💻 嵌套定时器</h2>
        <div className="section-content">
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`console.log('Start');

setTimeout(() => {
  console.log('Timeout 1');
  
  setTimeout(() => {
    console.log('Nested Timeout 2');
  }, 0);
  
  console.log('After nested setTimeout');
}, 0);

console.log('End');`}</code></pre>
          </div>

          <div className="visualization">
            <h3 style={{ marginBottom: '16px' }}>执行过程分析</h3>
            <pre style={{ background: '#f8f9fa', color: '#2c3e50', fontSize: '14px' }}>
{`1️⃣ 同步代码
   Start → End

2️⃣ 第一个宏任务
   Timeout 1 → After nested setTimeout
   (注册 Nested Timeout 2 到宏任务队列)

3️⃣ 第二个宏任务
   Nested Timeout 2

关键：
• 嵌套的setTimeout不会立即执行
• 而是作为新的宏任务加入队列
• 在当前宏任务完成后才会执行`}
            </pre>
          </div>

          <div className="interactive-demo">
            <button className="demo-button" onClick={runNestedTimeout}>
              运行嵌套定时器示例
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
        <h2 className="section-title">💻 setInterval示例</h2>
        <div className="section-content">
          <p>setInterval会重复执行回调，直到被清除：</p>
          
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`let count = 0;

const intervalId = setInterval(() => {
  count++;
  console.log(\`第 \${count} 次执行\`);
  
  if (count >= 5) {
    clearInterval(intervalId);
    console.log('setInterval 已清除');
  }
}, 500);`}</code></pre>
          </div>

          <div className="info-box warning">
            <strong>⚠️ setInterval的问题：</strong>
            <ul>
              <li>如果回调执行时间超过间隔时间，可能导致任务堆积</li>
              <li>不考虑回调的执行时间，可能导致不精确的间隔</li>
              <li>推荐使用setTimeout递归调用来替代</li>
            </ul>
          </div>

          <div className="interactive-demo">
            <button className="demo-button" onClick={runSetIntervalDemo}>
              运行setInterval示例
            </button>
            
            {timerOutput.length > 0 && (
              <div className="output-display">
                <h4 style={{ marginBottom: '10px' }}>执行结果：</h4>
                {timerOutput.map((line, index) => (
                  <div key={index} className="output-line">
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="highlight-box" style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '12px', color: '#667eea' }}>更好的替代方案：</h3>
            <pre style={{ background: '#fff' }}><code>{`// 使用递归setTimeout
function repeatTask() {
  console.log('执行任务');
  
  // 任务执行完后再设置下一次
  setTimeout(repeatTask, 1000);
}

repeatTask();`}</code></pre>
            <p style={{ marginTop: '12px' }}>这样可以确保每次执行之间有准确的间隔，不会堆积任务。</p>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">💻 最小延迟测试</h2>
        <div className="section-content">
          <p>setTimeout的延迟不是精确的，受多种因素影响：</p>
          
          <div className="code-block">
            <div className="code-header">
              <span>JavaScript</span>
            </div>
            <pre><code>{`const start = Date.now();

setTimeout(() => {
  const elapsed = Date.now() - start;
  console.log(\`setTimeout(0): 实际延迟 \${elapsed}ms\`);
}, 0);

// 阻塞主线程
const blockEnd = Date.now() + 10;
while (Date.now() < blockEnd) {
  // 忙等待
}

console.log(\`同步代码阻塞了 10ms\`);`}</code></pre>
          </div>

          <div className="info-box error">
            <strong>⚠️ 延迟不准确的原因：</strong>
            <ul>
              <li><strong>浏览器最小延迟：</strong>通常是4ms（嵌套定时器）或1ms</li>
              <li><strong>主线程阻塞：</strong>如果主线程忙，定时器会延迟执行</li>
              <li><strong>事件循环：</strong>需要等待当前任务和所有微任务完成</li>
              <li><strong>系统负载：</strong>CPU繁忙时可能延迟更多</li>
            </ul>
          </div>

          <div className="interactive-demo">
            <button className="demo-button" onClick={runMinimumDelay}>
              测试最小延迟
            </button>
            
            {output.length > 0 && (
              <div className="output-display">
                <h4 style={{ marginBottom: '10px' }}>测试结果：</h4>
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
            <h3 style={{ marginBottom: '12px' }}>陷阱1：忘记清除定时器</h3>
            <pre style={{ background: '#fff', marginTop: '12px' }}><code>{`// ❌ 内存泄漏
function startTimer() {
  setInterval(() => {
    console.log('tick');
  }, 1000);
  // 忘记清除，会一直执行
}

// ✅ 正确做法
function startTimer() {
  const id = setInterval(() => {
    console.log('tick');
  }, 1000);
  
  return () => clearInterval(id); // 返回清除函数
}`}</code></pre>
          </div>

          <div className="info-box warning">
            <h3 style={{ marginBottom: '12px' }}>陷阱2：在定时器中使用this</h3>
            <pre style={{ background: '#fff', marginTop: '12px' }}><code>{`// ❌ this丢失
class Timer {
  name = 'MyTimer';
  
  start() {
    setTimeout(function() {
      console.log(this.name); // undefined
    }, 1000);
  }
}

// ✅ 使用箭头函数
class Timer {
  name = 'MyTimer';
  
  start() {
    setTimeout(() => {
      console.log(this.name); // 'MyTimer'
    }, 1000);
  }
}`}</code></pre>
          </div>

          <div className="info-box error">
            <h3 style={{ marginBottom: '12px' }}>陷阱3：setInterval可能堆积任务</h3>
            <pre style={{ background: '#fff', marginTop: '12px' }}><code>{`// ❌ 如果任务执行时间 > 间隔时间
setInterval(() => {
  // 耗时操作（比如3秒）
  heavyTask();
}, 1000); // 可能导致多个任务同时执行

// ✅ 使用递归setTimeout
function scheduleTask() {
  heavyTask().then(() => {
    setTimeout(scheduleTask, 1000);
  });
}
scheduleTask();`}</code></pre>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">🔑 核心要点</h2>
        <div className="section-content">
          <div className="highlight-box">
            <ul style={{ lineHeight: '2' }}>
              <li>✅ setTimeout和setInterval都是<strong>宏任务</strong></li>
              <li>✅ 延迟时间是<strong>最小延迟</strong>，不保证精确</li>
              <li>✅ 定时器在<strong>微任务</strong>之后执行</li>
              <li>✅ 主线程阻塞会<strong>延迟</strong>定时器执行</li>
              <li>✅ 始终<strong>清除</strong>不需要的定时器</li>
              <li>✅ 推荐使用<strong>递归setTimeout</strong>代替setInterval</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerDemo;

