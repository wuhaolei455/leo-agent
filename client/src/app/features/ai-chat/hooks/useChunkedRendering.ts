import { useState, useEffect, useRef } from 'react'

/**
 * 基于时间切片思想的长文本分块渲染 Hook
 * 
 * 核心思想（借鉴 Fiber）：
 * 1. 将长文本分成小块
 * 2. 利用 requestIdleCallback 在浏览器空闲时渲染
 * 3. 不阻塞用户交互
 * 
 * 适用场景：
 * - AI 返回超长回复（代码、长文）
 * - 需要格式化的长内容（Markdown）
 */

interface ChunkedRenderingOptions {
  chunkSize?: number // 每次渲染的字符数
  delay?: number // 每块之间的延迟（ms）
  enabled?: boolean // 是否启用分块渲染
}

export function useChunkedRendering(
  content: string,
  options: ChunkedRenderingOptions = {}
) {
  const {
    chunkSize = 200, // 默认每次渲染 200 字符
    delay = 0,
    enabled = true
  } = options

  const [visibleContent, setVisibleContent] = useState('')
  const [isRendering, setIsRendering] = useState(false)
  const currentIndexRef = useRef(0)
  const rafIdRef = useRef<number>()
  const timeoutIdRef = useRef<number>()

  useEffect(() => {
    // 如果不启用分块渲染，直接显示全部内容
    if (!enabled || content.length <= chunkSize) {
      setVisibleContent(content)
      setIsRendering(false)
      return
    }

    // 重置状态
    currentIndexRef.current = 0
    setIsRendering(true)
    setVisibleContent('')

    const renderNextChunk = () => {
      const currentIndex = currentIndexRef.current
      
      if (currentIndex >= content.length) {
        setIsRendering(false)
        return
      }

      // 🎯 时间切片：每次只渲染一小块
      const nextIndex = Math.min(currentIndex + chunkSize, content.length)
      const nextContent = content.slice(0, nextIndex)
      
      setVisibleContent(nextContent)
      currentIndexRef.current = nextIndex

      // 继续渲染下一块
      if (nextIndex < content.length) {
        if (delay > 0) {
          timeoutIdRef.current = window.setTimeout(renderNextChunk, delay)
        } else {
          // 使用 requestAnimationFrame 保证不阻塞渲染
          rafIdRef.current = requestAnimationFrame(renderNextChunk)
        }
      } else {
        setIsRendering(false)
      }
    }

    // 开始渲染
    rafIdRef.current = requestAnimationFrame(renderNextChunk)

    // 清理函数
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
    }
  }, [content, chunkSize, delay, enabled])

  return {
    visibleContent,
    isRendering,
    progress: content.length > 0 ? (visibleContent.length / content.length) * 100 : 100
  }
}

/**
 * 基于 requestIdleCallback 的版本（更贴近 Fiber 思想）
 */
export function useIdleChunkedRendering(
  content: string,
  chunkSize: number = 200
) {
  const [visibleContent, setVisibleContent] = useState('')
  const currentIndexRef = useRef(0)
  const idleCallbackIdRef = useRef<number>()

  useEffect(() => {
    if (content.length <= chunkSize) {
      setVisibleContent(content)
      return
    }

    currentIndexRef.current = 0
    setVisibleContent('')

    const scheduleNextChunk = (deadline: IdleDeadline) => {
      // 🎯 Fiber 核心思想：在空闲时间工作
      while (
        deadline.timeRemaining() > 0 && 
        currentIndexRef.current < content.length
      ) {
        const nextIndex = Math.min(
          currentIndexRef.current + chunkSize,
          content.length
        )
        setVisibleContent(content.slice(0, nextIndex))
        currentIndexRef.current = nextIndex
      }

      // 如果还有未渲染的内容，继续调度
      if (currentIndexRef.current < content.length) {
        idleCallbackIdRef.current = requestIdleCallback(scheduleNextChunk)
      }
    }

    // 开始调度
    idleCallbackIdRef.current = requestIdleCallback(scheduleNextChunk)

    return () => {
      if (idleCallbackIdRef.current) {
        cancelIdleCallback(idleCallbackIdRef.current)
      }
    }
  }, [content, chunkSize])

  return visibleContent
}

/**
 * 使用示例：
 * 
 * function MessageBubble({ message }) {
 *   const { visibleContent, isRendering, progress } = useChunkedRendering(
 *     message.content,
 *     { 
 *       chunkSize: 100,
 *       enabled: message.content.length > 1000 // 只对长消息启用
 *     }
 *   )
 *   
 *   return (
 *     <div>
 *       <div>{visibleContent}</div>
 *       {isRendering && (
 *         <div>渲染中... {progress.toFixed(0)}%</div>
 *       )}
 *     </div>
 *   )
 * }
 */

