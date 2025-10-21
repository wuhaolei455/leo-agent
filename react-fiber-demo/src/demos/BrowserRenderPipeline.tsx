import React, { useState, useRef, useEffect } from 'react';
import './BrowserRenderPipeline.css';

/**
 * 浏览器渲染管道演示
 * 展示从 HTML/CSS 解析到最终屏幕显示的完整渲染流程
 */

// 渲染管道阶段
enum RenderPhase {
  PARSE_HTML = 'Parse HTML',
  BUILD_DOM_TREE = 'Build DOM Tree',
  PARSE_CSS = 'Parse CSS',
  BUILD_CSSOM_TREE = 'Build CSSOM Tree',
  BUILD_RENDER_TREE = 'Build Render Tree',
  LAYOUT = 'Layout (Reflow)',
  PAINT = 'Paint',
  COMPOSITE = 'Composite Layers'
}

interface RenderStep {
  phase: RenderPhase;
  description: string;
  duration: number;
  status: 'pending' | 'running' | 'completed';
  details: string[];
  icon: string;
}

// 模拟浏览器渲染过程
class BrowserRenderSimulator {
  private steps: RenderStep[] = [
    {
      phase: RenderPhase.PARSE_HTML,
      description: '解析 HTML 文档',
      duration: 0,
      status: 'pending',
      icon: '📄',
      details: [
        '读取 HTML 字节流',
        '字符编码转换（UTF-8）',
        '词法分析（Tokenization）',
        '构建 Token 序列',
      ]
    },
    {
      phase: RenderPhase.BUILD_DOM_TREE,
      description: '构建 DOM 树',
      duration: 0,
      status: 'pending',
      icon: '🌲',
      details: [
        'Token -> Node 转换',
        '建立父子关系',
        '处理嵌套结构',
        'DOM 树构建完成',
      ]
    },
    {
      phase: RenderPhase.PARSE_CSS,
      description: '解析 CSS 样式',
      duration: 0,
      status: 'pending',
      icon: '🎨',
      details: [
        '读取 CSS 文件',
        '解析选择器',
        '解析样式声明',
        '处理样式优先级',
      ]
    },
    {
      phase: RenderPhase.BUILD_CSSOM_TREE,
      description: '构建 CSSOM 树',
      duration: 0,
      status: 'pending',
      icon: '🎭',
      details: [
        '创建样式节点',
        '计算继承属性',
        '合并样式规则',
        'CSSOM 树构建完成',
      ]
    },
    {
      phase: RenderPhase.BUILD_RENDER_TREE,
      description: '构建渲染树',
      duration: 0,
      status: 'pending',
      icon: '🔗',
      details: [
        'DOM + CSSOM 合并',
        '过滤隐藏元素 (display:none)',
        '匹配样式规则',
        '生成渲染对象',
      ]
    },
    {
      phase: RenderPhase.LAYOUT,
      description: '布局（回流/Reflow）',
      duration: 0,
      status: 'pending',
      icon: '📐',
      details: [
        '计算元素位置',
        '计算元素尺寸',
        '处理盒模型',
        '确定几何信息',
      ]
    },
    {
      phase: RenderPhase.PAINT,
      description: '绘制',
      duration: 0,
      status: 'pending',
      icon: '🖌️',
      details: [
        '遍历渲染树',
        '调用绘制方法',
        '绘制文本、颜色、边框',
        '生成绘制列表',
      ]
    },
    {
      phase: RenderPhase.COMPOSITE,
      description: '合成图层',
      duration: 0,
      status: 'pending',
      icon: '✨',
      details: [
        '图层分离',
        'GPU 加速处理',
        '图层合成',
        '显示到屏幕',
      ]
    },
  ];

  async simulate(
    onProgress: (steps: RenderStep[], currentIndex: number) => void,
    onLog: (message: string, type: 'info' | 'success' | 'performance' | 'detail') => void
  ): Promise<void> {
    // 重置所有步骤
    this.steps.forEach(step => {
      step.status = 'pending';
      step.duration = 0;
    });

    onLog('🚀 开始浏览器渲染流程', 'info');
    console.log('%c🚀 ===== 浏览器渲染流程开始 =====', 'color: #4CAF50; font-size: 16px; font-weight: bold');

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      step.status = 'running';
      onProgress([...this.steps], i);
      
      const markStart = `render-${step.phase}-start`;
      const markEnd = `render-${step.phase}-end`;
      const measureName = `render-${step.phase}`;

      // 使用 Performance API 标记开始
      performance.mark(markStart);
      
      onLog(`${step.icon} ${step.phase}: ${step.description}`, 'info');
      console.log(`%c${step.icon} ${step.phase}`, 'color: #2196F3; font-weight: bold; font-size: 14px');
      
      // 模拟每个详细步骤
      for (const detail of step.details) {
        await this.delay(200 + Math.random() * 300);
        onLog(`  ├─ ${detail}`, 'detail');
        console.log(`  ├─ ${detail}`);
      }

      // 标记结束并测量
      performance.mark(markEnd);
      const measure = performance.measure(measureName, markStart, markEnd);
      step.duration = measure.duration;
      step.status = 'completed';
      
      onLog(`✅ ${step.phase} 完成 (${step.duration.toFixed(2)}ms)`, 'success');
      console.log(`%c✅ ${step.phase} 完成`, 'color: #4CAF50; font-weight: bold', `耗时: ${step.duration.toFixed(2)}ms`);
      
      onProgress([...this.steps], i);
      await this.delay(300);
    }

    // 计算总耗时
    const totalDuration = this.steps.reduce((sum, step) => sum + step.duration, 0);
    onLog(`🎉 渲染完成！总耗时: ${totalDuration.toFixed(2)}ms`, 'performance');
    console.log('%c🎉 ===== 浏览器渲染流程完成 =====', 'color: #4CAF50; font-size: 16px; font-weight: bold');
    console.log(`%c总耗时: ${totalDuration.toFixed(2)}ms`, 'color: #FF9800; font-size: 14px; font-weight: bold');

    // 输出性能分析
    console.group('📊 性能分析');
    this.steps.forEach(step => {
      const percentage = ((step.duration / totalDuration) * 100).toFixed(1);
      console.log(`${step.phase}: ${step.duration.toFixed(2)}ms (${percentage}%)`);
    });
    console.groupEnd();

    // 输出优化建议
    console.group('💡 优化建议');
    console.log('1. 减少 DOM 层级深度，降低 DOM 树构建时间');
    console.log('2. 压缩 CSS，使用 CSS 简写属性');
    console.log('3. 避免复杂的 CSS 选择器');
    console.log('4. 减少重排（Reflow）：批量修改样式，使用 transform 代替 top/left');
    console.log('5. 减少重绘（Repaint）：使用 will-change 提示浏览器');
    console.log('6. 使用 CSS3 动画和 transform 触发 GPU 加速');
    console.log('7. 图层分离：对动画元素使用独立图层');
    console.groupEnd();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getSteps(): RenderStep[] {
    return [...this.steps];
  }
}

const BrowserRenderPipeline: React.FC = () => {
  const [renderSteps, setRenderSteps] = useState<RenderStep[]>([]);
  const [renderLogs, setRenderLogs] = useState<Array<{ message: string; type: string }>>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const renderSimulatorRef = useRef(new BrowserRenderSimulator());
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 运行浏览器渲染演示
  const runBrowserRenderDemo = async () => {
    setIsRendering(true);
    setRenderLogs([]);
    setCurrentStepIndex(-1);
    setRenderSteps(renderSimulatorRef.current.getSteps());
    
    await renderSimulatorRef.current.simulate(
      (steps, currentIndex) => {
        setRenderSteps([...steps]);
        setCurrentStepIndex(currentIndex);
      },
      (message, type) => {
        setRenderLogs(prev => [...prev, { message, type }]);
      }
    );
    
    setIsRendering(false);
    setCurrentStepIndex(-1);
  };

  // 初始化渲染步骤
  useEffect(() => {
    setRenderSteps(renderSimulatorRef.current.getSteps());
  }, []);

  // 自动滚动日志到底部
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [renderLogs]);

  // 获取步骤状态的样式类
  const getStepClassName = (status: string) => {
    switch (status) {
      case 'running':
        return 'step-running';
      case 'completed':
        return 'step-completed';
      default:
        return 'step-pending';
    }
  };

  // 获取日志类型的样式类
  const getLogClassName = (type: string) => {
    switch (type) {
      case 'info':
        return 'log-info';
      case 'success':
        return 'log-success';
      case 'performance':
        return 'log-performance';
      case 'detail':
        return 'log-detail';
      default:
        return '';
    }
  };

  // 计算总耗时
  const totalDuration = renderSteps.reduce((sum, step) => sum + step.duration, 0);

  return (
    <div className="browser-render-pipeline">
      <h2>🖥️ 浏览器渲染管道演示</h2>
      <p className="description">
        浏览器从接收 HTML/CSS 到最终在屏幕上显示内容，经历了一系列复杂的处理步骤。
        这个演示将详细展示整个渲染管道的每个阶段，帮助你理解浏览器的工作原理。
      </p>

      <div className="control-section">
        <button 
          className="primary-button"
          onClick={runBrowserRenderDemo} 
          disabled={isRendering}
        >
          {isRendering ? '⏳ 渲染中...' : '🚀 开始渲染演示'}
        </button>
        {totalDuration > 0 && (
          <div className="total-time">
            总耗时: <strong>{totalDuration.toFixed(2)}ms</strong>
          </div>
        )}
      </div>

      <div className="pipeline-container">
        {/* 左侧：渲染流程可视化 */}
        <div className="pipeline-visual">
          <h3>渲染流程</h3>
          <div className="steps-timeline">
            {renderSteps.map((step, index) => (
              <div 
                key={step.phase}
                className={`step-card ${getStepClassName(step.status)} ${currentStepIndex === index ? 'step-current' : ''}`}
              >
                <div className="step-header">
                  <span className="step-icon">{step.icon}</span>
                  <span className="step-number">{index + 1}</span>
                </div>
                <div className="step-content">
                  <h4>{step.phase}</h4>
                  <p>{step.description}</p>
                  {step.duration > 0 && (
                    <div className="step-duration">
                      ⏱️ {step.duration.toFixed(2)}ms
                      {totalDuration > 0 && (
                        <span className="step-percentage">
                          {' '}({((step.duration / totalDuration) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  )}
                  {step.status === 'running' && (
                    <div className="step-progress">
                      <div className="progress-bar"></div>
                    </div>
                  )}
                </div>
                {step.status === 'completed' && (
                  <div className="step-check">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：实时日志 */}
        <div className="pipeline-logs">
          <h3>实时日志 <span className="log-count">({renderLogs.length})</span></h3>
          <div className="logs-container">
            {renderLogs.length === 0 ? (
              <div className="empty-state">
                <p>点击"开始渲染演示"按钮查看详细日志</p>
                <p className="hint">💡 日志会同时输出到浏览器控制台</p>
              </div>
            ) : (
              <>
                {renderLogs.map((log, i) => (
                  <div key={i} className={`log-entry ${getLogClassName(log.type)}`}>
                    {log.message}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* 性能图表 */}
      {totalDuration > 0 && (
        <div className="performance-chart">
          <h3>📊 性能分析</h3>
          <div className="chart-bars">
            {renderSteps.map((step) => {
              const percentage = (step.duration / totalDuration) * 100;
              return (
                <div key={step.phase} className="chart-bar-item">
                  <div className="bar-label">{step.icon} {step.phase}</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${percentage}%` }}
                      title={`${step.duration.toFixed(2)}ms (${percentage.toFixed(1)}%)`}
                    >
                      <span className="bar-text">{step.duration.toFixed(2)}ms</span>
                    </div>
                  </div>
                  <div className="bar-percentage">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 知识点说明 */}
      <div className="knowledge-section">
        <h3>🎓 关键概念详解</h3>
        <div className="concept-grid">
          <div className="concept-card">
            <h4>🌲 DOM 树</h4>
            <p>文档对象模型（Document Object Model）</p>
            <ul>
              <li>HTML 元素的树形结构表示</li>
              <li>每个节点代表一个 HTML 元素</li>
              <li>JavaScript 通过 DOM API 操作页面</li>
            </ul>
          </div>

          <div className="concept-card">
            <h4>🎨 CSSOM 树</h4>
            <p>CSS 对象模型（CSS Object Model）</p>
            <ul>
              <li>CSS 规则的树形结构表示</li>
              <li>包含样式选择器和声明</li>
              <li>用于计算元素的最终样式</li>
            </ul>
          </div>

          <div className="concept-card">
            <h4>🔗 渲染树</h4>
            <p>Render Tree</p>
            <ul>
              <li>DOM + CSSOM 合并的结果</li>
              <li>只包含可见元素</li>
              <li>每个节点包含样式信息</li>
            </ul>
          </div>

          <div className="concept-card">
            <h4>📐 布局（Layout）</h4>
            <p>也称为 Reflow（回流）</p>
            <ul>
              <li>计算元素的位置和尺寸</li>
              <li>触发条件：DOM 变化、样式变化</li>
              <li>性能影响大，应尽量减少</li>
            </ul>
          </div>

          <div className="concept-card">
            <h4>🖌️ 绘制（Paint）</h4>
            <p>也称为 Repaint（重绘）</p>
            <ul>
              <li>将元素绘制成像素</li>
              <li>生成绘制指令列表</li>
              <li>包括背景、边框、文本等</li>
            </ul>
          </div>

          <div className="concept-card">
            <h4>✨ 合成（Composite）</h4>
            <p>图层合成</p>
            <ul>
              <li>将多个图层合成最终图像</li>
              <li>GPU 加速处理</li>
              <li>transform/opacity 只触发合成</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 优化建议 */}
      <div className="optimization-section">
        <h3>💡 性能优化建议</h3>
        <div className="optimization-grid">
          <div className="optimization-card">
            <h4>🚀 减少重排（Reflow）</h4>
            <ul>
              <li>批量修改 DOM，使用 DocumentFragment</li>
              <li>使用 absolute/fixed 脱离文档流</li>
              <li>避免频繁读取布局属性（offsetHeight 等）</li>
              <li>使用 transform 代替 top/left</li>
              <li>避免使用 table 布局</li>
            </ul>
          </div>

          <div className="optimization-card">
            <h4>🎨 减少重绘（Repaint）</h4>
            <ul>
              <li>使用 visibility 代替 display</li>
              <li>避免频繁修改颜色、背景等样式</li>
              <li>使用 CSS3 动画代替 JavaScript 动画</li>
              <li>合理使用 will-change 属性</li>
            </ul>
          </div>

          <div className="optimization-card">
            <h4>⚡ 触发 GPU 加速</h4>
            <ul>
              <li>使用 transform: translateZ(0)</li>
              <li>使用 will-change: transform</li>
              <li>使用 3D 变换</li>
              <li>避免过多图层（内存消耗）</li>
            </ul>
          </div>

          <div className="optimization-card">
            <h4>📦 资源优化</h4>
            <ul>
              <li>压缩 HTML/CSS/JS 文件</li>
              <li>使用 CDN 加速资源加载</li>
              <li>懒加载图片和非关键资源</li>
              <li>使用字体子集减小字体文件</li>
              <li>启用 Gzip/Brotli 压缩</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 浏览器渲染与 React Fiber 的关系 */}
      <div className="relation-section">
        <h3>🔄 浏览器渲染 vs React Fiber</h3>
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>维度</th>
                <th>浏览器渲染</th>
                <th>React Fiber</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>工作内容</strong></td>
                <td>HTML/CSS → 屏幕像素</td>
                <td>Virtual DOM → Real DOM</td>
              </tr>
              <tr>
                <td><strong>可中断性</strong></td>
                <td>❌ 渲染流程不可中断</td>
                <td>✅ 可中断、可恢复</td>
              </tr>
              <tr>
                <td><strong>优先级</strong></td>
                <td>按照文档顺序处理</td>
                <td>高优先级任务可插队</td>
              </tr>
              <tr>
                <td><strong>优化目标</strong></td>
                <td>减少 Reflow 和 Repaint</td>
                <td>避免阻塞主线程</td>
              </tr>
              <tr>
                <td><strong>协作方式</strong></td>
                <td colSpan={2}>Fiber 尽量减少 DOM 操作，浏览器负责高效渲染</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BrowserRenderPipeline;

