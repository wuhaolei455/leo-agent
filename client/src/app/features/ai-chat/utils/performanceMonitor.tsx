import { useEffect, useState, useCallback, useRef } from 'react'

/**
 * 性能监控工具 - 监测 Fiber 优化效果
 * 
 * 监控指标：
 * 1. 帧率（FPS）
 * 2. 长任务（Long Tasks）
 * 3. 输入延迟（Input Delay）
 * 4. 渲染时间
 */

export interface PerformanceMetrics {
  fps: number
  longTasks: number
  avgInputDelay: number
  avgRenderTime: number
}

export class PerformanceMonitor {
  private frameTimes: number[] = []
  private longTasks: number = 0
  private inputDelays: number[] = []
  private renderTimes: number[] = []
  private rafId: number | null = null
  private lastFrameTime: number = performance.now()
  private isMonitoring: boolean = false

  /**
   * 开始监控
   */
  start(): void {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.reset()
    this.measureFPS()
    this.observeLongTasks()
  }

  /**
   * 停止监控
   */
  stop(): void {
    this.isMonitoring = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  /**
   * 重置指标
   */
  reset(): void {
    this.frameTimes = []
    this.longTasks = 0
    this.inputDelays = []
    this.renderTimes = []
  }

  /**
   * 获取当前指标
   */
  getMetrics(): PerformanceMetrics {
    const avgFPS = this.calculateAverageFPS()
    const avgInputDelay = this.calculateAverage(this.inputDelays)
    const avgRenderTime = this.calculateAverage(this.renderTimes)

    return {
      fps: avgFPS,
      longTasks: this.longTasks,
      avgInputDelay,
      avgRenderTime
    }
  }

  /**
   * 记录输入延迟
   */
  recordInputDelay(delay: number): void {
    this.inputDelays.push(delay)
    // 只保留最近 100 次
    if (this.inputDelays.length > 100) {
      this.inputDelays.shift()
    }
  }

  /**
   * 记录渲染时间
   */
  recordRenderTime(time: number): void {
    this.renderTimes.push(time)
    if (this.renderTimes.length > 100) {
      this.renderTimes.shift()
    }
  }

  /**
   * 测量 FPS
   */
  private measureFPS(): void {
    const measure = (currentTime: number) => {
      if (!this.isMonitoring) return

      const deltaTime = currentTime - this.lastFrameTime
      this.frameTimes.push(deltaTime)
      
      // 只保留最近 60 帧的数据
      if (this.frameTimes.length > 60) {
        this.frameTimes.shift()
      }

      this.lastFrameTime = currentTime
      this.rafId = requestAnimationFrame(measure)
    }

    this.rafId = requestAnimationFrame(measure)
  }

  /**
   * 监听长任务（需要浏览器支持 PerformanceObserver）
   */
  private observeLongTasks(): void {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported')
      return
    }

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // 超过 50ms 的任务被认为是长任务
          if (entry.duration > 50) {
            this.longTasks++
          }
        }
      })

      observer.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.warn('Long task observation not supported:', error)
    }
  }

  /**
   * 计算平均 FPS
   */
  private calculateAverageFPS(): number {
    if (this.frameTimes.length === 0) return 60

    const avgFrameTime = this.calculateAverage(this.frameTimes)
    return Math.round(1000 / avgFrameTime)
  }

  /**
   * 计算平均值
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0
    const sum = values.reduce((acc, val) => acc + val, 0)
    return Math.round(sum / values.length)
  }
}

/**
 * React Hook 包装
 */
export function usePerformanceMonitor() {
  const monitorRef = useRef<PerformanceMonitor | null>(null)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    longTasks: 0,
    avgInputDelay: 0,
    avgRenderTime: 0
  })

  useEffect(() => {
    monitorRef.current = new PerformanceMonitor()
    monitorRef.current.start()

    // 每秒更新一次指标
    const interval = setInterval(() => {
      if (monitorRef.current) {
        setMetrics(monitorRef.current.getMetrics())
      }
    }, 1000)

    return () => {
      clearInterval(interval)
      if (monitorRef.current) {
        monitorRef.current.stop()
      }
    }
  }, [])

  const recordInputDelay = useCallback((delay: number) => {
    monitorRef.current?.recordInputDelay(delay)
  }, [])

  const recordRenderTime = useCallback((time: number) => {
    monitorRef.current?.recordRenderTime(time)
  }, [])

  return {
    metrics,
    recordInputDelay,
    recordRenderTime
  }
}

/**
 * 性能监控面板组件
 */
export function PerformancePanel() {
  const { metrics } = usePerformanceMonitor()

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'green'
    if (fps >= 30) return 'orange'
    return 'red'
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999
    }}>
      <div>
        <strong>性能监控</strong>
      </div>
      <div style={{ color: getFPSColor(metrics.fps) }}>
        FPS: {metrics.fps}
      </div>
      <div>
        长任务: {metrics.longTasks}
      </div>
      <div>
        输入延迟: {metrics.avgInputDelay}ms
      </div>
      <div>
        渲染时间: {metrics.avgRenderTime}ms
      </div>
    </div>
  )
}

// 导出单例
export const performanceMonitor = new PerformanceMonitor()

/**
 * 使用示例：
 * 
 * import { PerformancePanel } from './utils/performanceMonitor'
 * 
 * function App() {
 *   return (
 *     <>
 *       <FiberOptimizedChatPanel />
 *       <PerformancePanel />  // 显示实时性能指标
 *     </>
 *   )
 * }
 */

