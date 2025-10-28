import React, { useState } from 'react';

const InterviewQuestions: React.FC = () => {
  const [outputs, setOutputs] = useState<{ [key: string]: string[] }>({});

  const runQuestion = (questionId: string, executor: () => void) => {
    const logs: string[] = [];
    const originalLog = console.log;
    
    // 劫持console.log
    console.log = (...args: any[]) => {
      logs.push(args.join(' '));
    };

    try {
      executor();
    } finally {
      console.log = originalLog;
      
      // 等待所有异步任务完成
      setTimeout(() => {
        setOutputs(prev => ({ ...prev, [questionId]: logs }));
      }, 200);
    }
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1 className="demo-title">💡 面试题精选</h1>
        <p className="demo-subtitle">
          掌握常见的事件循环面试题，提升你的面试通过率
        </p>
      </div>

      {/* 问题1 */}
      <div className="demo-section">
        <h2 className="section-title">📝 面试题1：经典执行顺序</h2>
        <div className="section-content">
          <div className="code-block">
            <div className="code-header">
              <span>请写出以下代码的输出顺序</span>
            </div>
            <pre><code>{`console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => {
    console.log('3');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('4');
  setTimeout(() => {
    console.log('5');
  }, 0);
});

console.log('6');`}</code></pre>
          </div>

          <div className="interactive-demo">
            <button 
              className="demo-button" 
              onClick={() => runQuestion('q1', () => {
                console.log('1');

                setTimeout(() => {
                  console.log('2');
                  Promise.resolve().then(() => {
                    console.log('3');
                  });
                }, 0);

                Promise.resolve().then(() => {
                  console.log('4');
                  setTimeout(() => {
                    console.log('5');
                  }, 0);
                });

                console.log('6');
              })}
            >
              运行查看答案
            </button>
            
            {outputs['q1'] && (
              <div className="output-display">
                <h4 style={{ marginBottom: '10px' }}>执行结果：</h4>
                {outputs['q1'].map((line, index) => (
                  <div key={index} className="output-line">
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="highlight-box">
            <h3 style={{ marginBottom: '12px', color: '#667eea' }}>📊 解析</h3>
            <pre style={{ background: '#fff', fontSize: '14px' }}>{`执行流程：

1️⃣ 同步代码
   • 输出 '1'
   • 注册 setTimeout (宏任务1)
   • 注册 Promise.then (微任务1)
   • 输出 '6'

2️⃣ 微任务队列
   • 执行微任务1，输出 '4'
   • 注册新的 setTimeout (宏任务2)

3️⃣ 宏任务1
   • 输出 '2'
   • 注册 Promise.then (微任务2)

4️⃣ 微任务队列
   • 执行微任务2，输出 '3'

5️⃣ 宏任务2
   • 输出 '5'

✅ 答案：1 → 6 → 4 → 2 → 3 → 5`}</pre>
          </div>
        </div>
      </div>

      {/* 问题2 */}
      <div className="demo-section">
        <h2 className="section-title">📝 面试题2：Async/Await执行顺序</h2>
        <div className="section-content">
          <div className="code-block">
            <div className="code-header">
              <span>请写出以下代码的输出顺序</span>
            </div>
            <pre><code>{`async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

                async1();

                new Promise<void>((resolve) => {
                  console.log('promise1');
                  resolve();
                }).then(() => {
                  console.log('promise2');
                });

                console.log('script end');`}</code></pre>
          </div>

          <div className="interactive-demo">
            <button 
              className="demo-button" 
              onClick={() => runQuestion('q2', async () => {
                async function async1() {
                  console.log('async1 start');
                  await async2();
                  console.log('async1 end');
                }

                async function async2() {
                  console.log('async2');
                }

                console.log('script start');

                setTimeout(() => {
                  console.log('setTimeout');
                }, 0);

                async1();

                new Promise<void>((resolve) => {
                  console.log('promise1');
                  resolve();
                }).then(() => {
                  console.log('promise2');
                });

                console.log('script end');
              })}
            >
              运行查看答案
            </button>
            
            {outputs['q2'] && (
              <div className="output-display">
                <h4 style={{ marginBottom: '10px' }}>执行结果：</h4>
                {outputs['q2'].map((line, index) => (
                  <div key={index} className="output-line">
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="highlight-box">
            <h3 style={{ marginBottom: '12px', color: '#667eea' }}>📊 解析</h3>
            <pre style={{ background: '#fff', fontSize: '14px' }}>{`执行流程：

1️⃣ 同步代码执行
   • 输出 'script start'
   • 注册 setTimeout (宏任务)
   • 调用 async1()
     - 输出 'async1 start'
     - 调用 async2()，输出 'async2'
     - await 暂停，后续代码成为微任务
   • 执行 Promise 构造函数，输出 'promise1'
   • 注册 .then (微任务)
   • 输出 'script end'

2️⃣ 微任务队列
   • async1 的后续代码，输出 'async1 end'
   • Promise.then，输出 'promise2'

3️⃣ 宏任务
   • 输出 'setTimeout'

✅ 答案：
script start → async1 start → async2 → promise1 
→ script end → async1 end → promise2 → setTimeout`}</pre>
          </div>
        </div>
      </div>

      {/* 问题3 */}
      <div className="demo-section">
        <h2 className="section-title">📝 面试题3：Promise链式调用</h2>
        <div className="section-content">
          <div className="code-block">
            <div className="code-header">
              <span>请写出以下代码的输出顺序</span>
            </div>
            <pre><code>{`Promise.resolve()
  .then(() => {
    console.log('1');
    return Promise.resolve('2');
  })
  .then((res) => {
    console.log(res);
  });

Promise.resolve()
  .then(() => {
    console.log('3');
  })
  .then(() => {
    console.log('4');
  })
  .then(() => {
    console.log('5');
  });`}</code></pre>
          </div>

          <div className="interactive-demo">
            <button 
              className="demo-button" 
              onClick={() => runQuestion('q3', () => {
                Promise.resolve()
                  .then(() => {
                    console.log('1');
                    return Promise.resolve('2');
                  })
                  .then((res) => {
                    console.log(res);
                  });

                Promise.resolve()
                  .then(() => {
                    console.log('3');
                  })
                  .then(() => {
                    console.log('4');
                  })
                  .then(() => {
                    console.log('5');
                  });
              })}
            >
              运行查看答案
            </button>
            
            {outputs['q3'] && (
              <div className="output-display">
                <h4 style={{ marginBottom: '10px' }}>执行结果：</h4>
                {outputs['q3'].map((line, index) => (
                  <div key={index} className="output-line">
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="highlight-box">
            <h3 style={{ marginBottom: '12px', color: '#667eea' }}>📊 解析</h3>
            <pre style={{ background: '#fff', fontSize: '14px' }}>{`执行流程：

微任务队列的执行：

1️⃣ [then1, then3]
   • 执行 then1，输出 '1'
   • 返回 Promise.resolve('2')，需要额外的微任务来unwrap
   • 执行 then3，输出 '3'
   • 注册 then4

2️⃣ [unwrap, then4]
   • unwrap Promise
   • 执行 then4，输出 '4'
   • 注册 then5

3️⃣ [then2, then5]
   • 执行 then2，输出 '2'
   • 执行 then5，输出 '5'

✅ 答案：1 → 3 → 4 → 2 → 5

⚠️ 关键点：
• 返回 Promise.resolve() 需要额外的微任务
• 如果返回普通值，会立即传递给下一个 then`}</pre>
          </div>
        </div>
      </div>

      {/* 问题4 */}
      <div className="demo-section">
        <h2 className="section-title">📝 面试题4：综合考察</h2>
        <div className="section-content">
          <div className="code-block">
            <div className="code-header">
              <span>请写出以下代码的输出顺序</span>
            </div>
            <pre><code>{`console.log('Start');

setTimeout(() => {
  console.log('Timeout 1');
  Promise.resolve().then(() => {
    console.log('Promise in Timeout 1');
  });
}, 0);

new Promise((resolve) => {
  console.log('Promise executor');
  resolve();
})
  .then(() => {
    console.log('Promise 1');
    setTimeout(() => {
      console.log('Timeout 2');
    }, 0);
  })
  .then(() => {
    console.log('Promise 2');
  });

setTimeout(() => {
  console.log('Timeout 3');
}, 0);

console.log('End');`}</code></pre>
          </div>

          <div className="interactive-demo">
            <button 
              className="demo-button" 
              onClick={() => runQuestion('q4', () => {
                console.log('Start');

                setTimeout(() => {
                  console.log('Timeout 1');
                  Promise.resolve().then(() => {
                    console.log('Promise in Timeout 1');
                  });
                }, 0);

                new Promise<void>((resolve) => {
                  console.log('Promise executor');
                  resolve();
                })
                  .then(() => {
                    console.log('Promise 1');
                    setTimeout(() => {
                      console.log('Timeout 2');
                    }, 0);
                  })
                  .then(() => {
                    console.log('Promise 2');
                  });

                setTimeout(() => {
                  console.log('Timeout 3');
                }, 0);

                console.log('End');
              })}
            >
              运行查看答案
            </button>
            
            {outputs['q4'] && (
              <div className="output-display">
                <h4 style={{ marginBottom: '10px' }}>执行结果：</h4>
                {outputs['q4'].map((line, index) => (
                  <div key={index} className="output-line">
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="highlight-box">
            <h3 style={{ marginBottom: '12px', color: '#667eea' }}>📊 解析</h3>
            <pre style={{ background: '#fff', fontSize: '14px' }}>{`完整执行流程：

1️⃣ 同步代码
   Start → Promise executor → End

2️⃣ 微任务（第1轮）
   Promise 1 → Promise 2
   (Promise 1 中注册了 Timeout 2)

3️⃣ 宏任务1 (Timeout 1)
   Timeout 1
   注册微任务：Promise in Timeout 1

4️⃣ 微任务（第2轮）
   Promise in Timeout 1

5️⃣ 宏任务2 (Timeout 3)
   Timeout 3

6️⃣ 宏任务3 (Timeout 2)
   Timeout 2

✅ 完整答案：
Start → Promise executor → End 
→ Promise 1 → Promise 2 
→ Timeout 1 → Promise in Timeout 1 
→ Timeout 3 → Timeout 2`}</pre>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">🎓 面试技巧总结</h2>
        <div className="section-content">
          <div className="highlight-box">
            <h3 style={{ marginBottom: '16px', color: '#667eea' }}>解题方法论</h3>
            <ol style={{ lineHeight: '2' }}>
              <li><strong>第一步：</strong>找出所有<strong>同步代码</strong>，按顺序执行</li>
              <li><strong>第二步：</strong>找出所有<strong>微任务</strong>（Promise.then、async/await后续代码）</li>
              <li><strong>第三步：</strong>找出所有<strong>宏任务</strong>（setTimeout、setInterval）</li>
              <li><strong>第四步：</strong>按照"同步 → 所有微任务 → 一个宏任务 → 所有微任务"的顺序执行</li>
              <li><strong>第五步：</strong>注意嵌套任务会产生新的任务加入队列</li>
            </ol>
          </div>

          <div className="info-box">
            <h3 style={{ marginBottom: '12px' }}>⚡ 快速记忆口诀</h3>
            <p style={{ fontSize: '18px', lineHeight: '2', textAlign: 'center' }}>
              <strong>
                同步优先，微任务次之<br/>
                清空微任务，再取宏任务<br/>
                循环往复，直到队列空
              </strong>
            </p>
          </div>

          <div className="info-box success">
            <h3 style={{ marginBottom: '12px' }}>✅ 高频考点</h3>
            <ul style={{ lineHeight: '1.8' }}>
              <li>Promise.then 和 setTimeout 的执行顺序</li>
              <li>async/await 与 Promise 的关系</li>
              <li>返回 Promise.resolve() 的额外微任务</li>
              <li>嵌套定时器和Promise的执行顺序</li>
              <li>微任务队列何时清空</li>
              <li>宏任务如何逐个执行</li>
            </ul>
          </div>

          <div className="info-box warning">
            <h3 style={{ marginBottom: '12px' }}>⚠️ 易错点</h3>
            <ul style={{ lineHeight: '1.8' }}>
              <li>Promise构造函数中的代码是<strong>同步执行</strong>的</li>
              <li>async函数在await<strong>之前</strong>的代码是同步的</li>
              <li>每个宏任务执行完都会<strong>清空所有微任务</strong></li>
              <li>微任务中产生的新微任务会在<strong>当前周期</strong>执行</li>
              <li>setTimeout(0) 不是立即执行，而是下一个宏任务</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="section-title">🔑 核心要点</h2>
        <div className="section-content">
          <div className="highlight-box">
            <ul style={{ lineHeight: '2' }}>
              <li>✅ 掌握<strong>执行顺序</strong>：同步 → 微任务 → 宏任务</li>
              <li>✅ 理解<strong>任务队列</strong>：微任务优先级高于宏任务</li>
              <li>✅ 注意<strong>嵌套任务</strong>：会产生新的任务加入队列</li>
              <li>✅ 熟记<strong>API分类</strong>：哪些是宏任务，哪些是微任务</li>
              <li>✅ 多做<strong>练习题</strong>：熟能生巧，形成肌肉记忆</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewQuestions;

