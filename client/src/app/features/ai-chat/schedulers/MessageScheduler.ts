/**
 * 消息调度器 - 借鉴 React Fiber 调度思想
 * 
 * 核心功能：
 * 1. 优先级队列：管理不同优先级的消息更新任务
 * 2. 时间切片：将大批量消息更新分散到多个帧中
 * 3. 可中断：高优先级任务可以打断低优先级任务
 */

export enum MessagePriority {
  IMMEDIATE = 0,  // 用户消息、错误消息
  HIGH = 1,       // 完成状态更新
  NORMAL = 2,     // 流式内容更新
  LOW = 3,        // 历史消息加载
  IDLE = 4        // 预加载、统计
}

export interface ScheduledTask {
  id: string
  priority: MessagePriority
  callback: () => void
  expirationTime: number
}

export class MessageScheduler {
  private taskQueue: ScheduledTask[] = []
  private isPerformingWork = false
  private currentTask: ScheduledTask | null = null
  private rafId: number | null = null

  /**
   * 调度一个任务
   */
  scheduleTask(
    callback: () => void,
    priority: MessagePriority = MessagePriority.NORMAL
  ): string {
    const taskId = `task-${Date.now()}-${Math.random()}`
    const currentTime = Date.now()
    
    // 根据优先级计算过期时间
    const timeout = this.getTimeoutForPriority(priority)
    const expirationTime = currentTime + timeout

    const newTask: ScheduledTask = {
      id: taskId,
      priority,
      callback,
      expirationTime
    }

    // 插入任务队列（按优先级和过期时间排序）
    this.insertTask(newTask)

    // 🎯 开始调度工作循环
    if (!this.isPerformingWork) {
      this.requestHostCallback()
    }

    return taskId
  }

  /**
   * 取消任务
   */
  cancelTask(taskId: string): boolean {
    const index = this.taskQueue.findIndex(task => task.id === taskId)
    if (index !== -1) {
      this.taskQueue.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 清空所有任务
   */
  clearAll(): void {
    this.taskQueue = []
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.isPerformingWork = false
    this.currentTask = null
  }

  /**
   * 插入任务到队列（按优先级排序）
   */
  private insertTask(newTask: ScheduledTask): void {
    let insertIndex = 0
    
    // 找到合适的插入位置
    for (let i = 0; i < this.taskQueue.length; i++) {
      const task = this.taskQueue[i]
      
      // 优先级高的排前面，优先级相同则按过期时间排序
      if (
        newTask.priority < task.priority ||
        (newTask.priority === task.priority && 
         newTask.expirationTime < task.expirationTime)
      ) {
        insertIndex = i
        break
      }
      insertIndex = i + 1
    }

    this.taskQueue.splice(insertIndex, 0, newTask)
  }

  /**
   * 根据优先级获取超时时间
   */
  private getTimeoutForPriority(priority: MessagePriority): number {
    switch (priority) {
      case MessagePriority.IMMEDIATE:
        return -1 // 立即执行
      case MessagePriority.HIGH:
        return 250
      case MessagePriority.NORMAL:
        return 5000
      case MessagePriority.LOW:
        return 10000
      case MessagePriority.IDLE:
        return 1073741823 // 最大超时
      default:
        return 5000
    }
  }

  /**
   * 请求执行回调（使用 requestAnimationFrame）
   */
  private requestHostCallback(): void {
    this.rafId = requestAnimationFrame(() => {
      this.flushWork()
    })
  }

  /**
   * 执行工作循环 - 🎯 这是 Fiber 调度的核心
   */
  private flushWork(): void {
    this.isPerformingWork = true
    const currentTime = Date.now()
    const frameDeadline = currentTime + 5 // 每帧 5ms 的预算

    try {
      // 🎯 时间切片：在帧预算内尽可能多地执行任务
      while (
        this.taskQueue.length > 0 &&
        Date.now() < frameDeadline
      ) {
        const task = this.taskQueue.shift()
        if (!task) break

        this.currentTask = task

        try {
          // 执行任务
          task.callback()
        } catch (error) {
          console.error('Task execution error:', error)
        }

        this.currentTask = null
      }

      // 如果还有未完成的任务，继续调度
      if (this.taskQueue.length > 0) {
        this.requestHostCallback()
      } else {
        this.isPerformingWork = false
      }
    } catch (error) {
      // 出错时重新调度
      this.isPerformingWork = false
      this.requestHostCallback()
    }
  }

  /**
   * 获取当前队列状态（用于调试）
   */
  getQueueStatus(): {
    queueLength: number
    currentTask: string | null
    isPerformingWork: boolean
  } {
    return {
      queueLength: this.taskQueue.length,
      currentTask: this.currentTask?.id || null,
      isPerformingWork: this.isPerformingWork
    }
  }
}

// 导出单例
export const messageScheduler = new MessageScheduler()

/**
 * 使用示例：
 * 
 * import { messageScheduler, MessagePriority } from './MessageScheduler'
 * 
 * // 调度用户消息更新（高优先级）
 * messageScheduler.scheduleTask(
 *   () => dispatch({ type: 'ADD_MESSAGE', payload: userMessage }),
 *   MessagePriority.IMMEDIATE
 * )
 * 
 * // 调度流式内容更新（普通优先级）
 * messageScheduler.scheduleTask(
 *   () => dispatch({ type: 'UPDATE_MESSAGE', payload: chunk }),
 *   MessagePriority.NORMAL
 * )
 * 
 * // 调度历史消息加载（低优先级）
 * messageScheduler.scheduleTask(
 *   () => loadHistoryMessages(),
 *   MessagePriority.LOW
 * )
 */

