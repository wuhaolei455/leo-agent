import React, { useState } from 'react';
import './GeneratorBasics.css';

/**
 * Generator 函数基础演示
 * Generator 是 ES6 引入的一种特殊函数，可以暂停执行并在之后恢复
 */

// 1. 基础 Generator 函数
function* simpleGenerator() {
  console.log('开始执行');
  yield 1;
  console.log('继续执行');
  yield 2;
  console.log('再次执行');
  yield 3;
  console.log('执行完毕');
}

// 2. 带参数的 Generator
function* generatorWithParams(max: number): Generator<number, void, boolean | undefined> {
  let count = 0;
  while (count < max) {
    // yield 可以接收外部传入的值
    const reset = yield count;
    if (reset) {
      count = 0;
    } else {
      count++;
    }
  }
}

// 3. 模拟任务执行的 Generator
function* taskGenerator(tasks: string[]) {
  for (let i = 0; i < tasks.length; i++) {
    yield {
      index: i,
      task: tasks[i],
      progress: ((i + 1) / tasks.length) * 100,
    };
  }
}

// 4. 可中断的计算任务
function* heavyComputation(n: number) {
  let result = 0;
  for (let i = 0; i <= n; i++) {
    result += i;
    // 每处理一定数量就暂停，让出控制权
    if (i % 100000 === 0) {
      yield {
        current: i,
        total: n,
        progress: (i / n) * 100,
        result,
      };
    }
  }
  return result;
}

const GeneratorBasics: React.FC = () => {
  const [simpleOutput, setSimpleOutput] = useState<string[]>([]);
  const [countOutput, setCountOutput] = useState<number[]>([]);
  const [taskOutput, setTaskOutput] = useState<string>('');
  const [computeProgress, setComputeProgress] = useState<number>(0);
  const [computeResult, setComputeResult] = useState<number | null>(null);

  // 演示1: 简单Generator
  const runSimpleGenerator = () => {
    const gen = simpleGenerator();
    const results: string[] = [];
    
    let result = gen.next();
    while (!result.done) {
      results.push(`yield 返回值: ${result.value}`);
      result = gen.next();
    }
    
    setSimpleOutput(results);
  };

  // 演示2: 带参数的Generator
  const runParamGenerator = () => {
    const gen = generatorWithParams(5);
    const results: number[] = [];
    
    let result = gen.next();
    while (!result.done) {
      results.push(result.value);
      // 当count为3时，传入true重置
      result = gen.next(result.value === 3);
    }
    
    setCountOutput(results);
  };

  // 演示3: 任务执行
  const runTaskGenerator = () => {
    const tasks = [
      '解析 JSX',
      '创建 Fiber 节点',
      '构建 Fiber 树',
      '标记副作用',
      '提交更新',
    ];
    
    const gen = taskGenerator(tasks);
    let output = '';
    let result = gen.next();
    
    while (!result.done) {
      const { index, task, progress } = result.value;
      output += `[${index}] ${task} - 进度: ${progress.toFixed(0)}%\n`;
      result = gen.next();
    }
    
    setTaskOutput(output);
  };

  // 演示4: 可中断的计算（模拟Fiber的时间切片）
  const runHeavyComputation = () => {
    setComputeProgress(0);
    setComputeResult(null);
    
    const gen = heavyComputation(1000000);
    
    // 使用 setTimeout 模拟时间切片
    const scheduleWork = () => {
      const start = performance.now();
      let result = gen.next();
      
      // 处理多个步骤，但不超过5ms（模拟React的时间切片）
      while (!result.done && performance.now() - start < 5) {
        result = gen.next();
      }
      
      if (!result.done && result.value) {
        setComputeProgress(result.value.progress);
        // 让出控制权，在下一帧继续
        requestAnimationFrame(scheduleWork);
      } else {
        setComputeProgress(100);
        setComputeResult(result.value as number);
      }
    };
    
    scheduleWork();
  };

  return (
    <div className="generator-basics">
      <h2>🎯 Generator 函数基础演示</h2>
      <p className="description">
        Generator 函数是 ES6 引入的一种可以暂停和恢复执行的函数。
        React Fiber 的核心思想就是受到了 Generator 的启发，
        实现了可中断的渲染过程。
      </p>

      <div className="demo-section">
        <h3>1. 基础 Generator</h3>
        <p>Generator 函数使用 function* 声明，通过 yield 关键字暂停执行</p>
        <button onClick={runSimpleGenerator}>运行示例</button>
        <pre className="output">
          {simpleOutput.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </pre>
        <div className="code-block">
          <code>{`function* simpleGenerator() {
  yield 1;  // 暂停，返回1
  yield 2;  // 继续，暂停，返回2
  yield 3;  // 继续，暂停，返回3
}`}</code>
        </div>
      </div>

      <div className="demo-section">
        <h3>2. 双向通信</h3>
        <p>Generator 不仅可以向外输出值，还可以接收外部传入的值</p>
        <button onClick={runParamGenerator}>运行示例</button>
        <pre className="output">
          计数序列: {countOutput.join(' → ')}
        </pre>
        <div className="code-block">
          <code>{`function* counter(max) {
  let count = 0;
  while (count < max) {
    const reset = yield count;
    if (reset) count = 0;
    else count++;
  }
}`}</code>
        </div>
      </div>

      <div className="demo-section">
        <h3>3. 模拟任务调度</h3>
        <p>使用 Generator 可以将大任务分解成小步骤，每一步都可以暂停</p>
        <button onClick={runTaskGenerator}>运行示例</button>
        <pre className="output">{taskOutput}</pre>
      </div>

      <div className="demo-section">
        <h3>4. 可中断的计算（时间切片）</h3>
        <p>模拟 React Fiber 的时间切片机制，将大型计算分散到多个帧中执行</p>
        <button onClick={runHeavyComputation}>运行计算</button>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${computeProgress}%` }}>
            {computeProgress.toFixed(1)}%
          </div>
        </div>
        {computeResult !== null && (
          <div className="result">
            计算结果: {computeResult.toLocaleString()}
          </div>
        )}
        <div className="note">
          💡 注意：计算过程中页面依然可以响应用户交互，不会卡顿
        </div>
      </div>

      <div className="summary">
        <h3>🔑 核心概念总结</h3>
        <ul>
          <li><strong>yield</strong>: 暂停函数执行，返回一个值</li>
          <li><strong>next()</strong>: 恢复函数执行，可以传入值</li>
          <li><strong>可中断性</strong>: 函数可以在任意 yield 处暂停和恢复</li>
          <li><strong>协程</strong>: Generator 实现了协程的概念，可以在多个任务间切换</li>
          <li><strong>Fiber 的启发</strong>: React Fiber 受 Generator 启发，实现了可中断的渲染</li>
        </ul>
      </div>
    </div>
  );
};

export default GeneratorBasics;

