import { useCallback, useRef, startTransition } from 'react'
import { useChatContext } from '../context/ChatContext'
import { streamChat } from '../services/streamService'
import { ChatMessage } from '../types'

/**
 * 优化版的 AI Chat Hook
 * 
 * 使用 React 18 并发特性：
 * 1. startTransition: 将流式更新标记为低优先级
 * 2. 节流更新: 避免过于频繁的状态更新
 */
export function useOptimizedAiChat() {
  const { state, dispatch } = useChatContext()
  const cancelStreamRef = useRef<(() => void) | null>(null)
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingContentRef = useRef<string>('')

  const sendMessage = useCallback(async (message?: string) => {
    const content = message?.trim() || ''
    if (!content) return

    // 1. 用户消息 - 高优先级，立即更新
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      status: 'idle',
      createdAt: Date.now()
    }
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage })

    // 2. AI 回复占位 - 高优先级
    const assistantMessageId = `assistant-${Date.now()}`
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      status: 'streaming',
      createdAt: Date.now()
    }
    dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage })
    dispatch({ type: 'SET_STREAMING', payload: true })

    try {
      let accumulatedContent = ''
      
      // 🎯 节流更新函数 - 避免每个 chunk 都触发渲染
      const throttledUpdate = (content: string) => {
        pendingContentRef.current = content
        
        if (throttleTimerRef.current) {
          return // 已经有定时器在等待，跳过本次更新
        }

        throttleTimerRef.current = setTimeout(() => {
          // 🎯 使用 startTransition 将流式更新标记为低优先级
          // 这样不会阻塞用户的其他操作（如滚动、输入等）
          startTransition(() => {
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: { 
                id: assistantMessageId, 
                content: pendingContentRef.current 
              }
            })
          })
          throttleTimerRef.current = null
        }, 50) // 每 50ms 最多更新一次
      }

      const cancelFn = await streamChat(content, {
        onMessage: (chunk: string) => {
          accumulatedContent += chunk
          throttledUpdate(accumulatedContent)
        },
        onComplete: () => {
          // 清理定时器并立即更新最终内容
          if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current)
            throttleTimerRef.current = null
          }
          
          // 完成消息 - 高优先级，立即更新
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: { id: assistantMessageId, content: accumulatedContent }
          })
          dispatch({
            type: 'UPDATE_MESSAGE_STATUS',
            payload: { id: assistantMessageId, status: 'idle' }
          })
          dispatch({ type: 'SET_STREAMING', payload: false })
          cancelStreamRef.current = null
        },
        onError: (error: Error) => {
          // 错误处理 - 高优先级
          if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current)
            throttleTimerRef.current = null
          }
          
          dispatch({
            type: 'UPDATE_MESSAGE_STATUS',
            payload: { id: assistantMessageId, status: 'error' }
          })
          dispatch({ type: 'SET_ERROR', payload: error.message })
          dispatch({ type: 'SET_STREAMING', payload: false })
          cancelStreamRef.current = null
        }
      })

      cancelStreamRef.current = cancelFn

    } catch (error) {
      dispatch({
        type: 'UPDATE_MESSAGE_STATUS',
        payload: { id: assistantMessageId, status: 'error' }
      })
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : '未知错误'
      })
      dispatch({ type: 'SET_STREAMING', payload: false })
    }
  }, [dispatch])

  const stopStreaming = useCallback(() => {
    if (cancelStreamRef.current) {
      cancelStreamRef.current()
      cancelStreamRef.current = null
      dispatch({ type: 'SET_STREAMING', payload: false })
    }
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current)
      throttleTimerRef.current = null
    }
  }, [dispatch])

  const resetChat = useCallback(() => {
    stopStreaming()
    dispatch({ type: 'RESET_CHAT' })
  }, [dispatch, stopStreaming])

  return {
    messages: state.messages,
    isStreaming: state.isStreaming,
    error: state.error,
    remainQuota: state.remainQuota,
    sendMessage,
    stopStreaming,
    resetChat
  }
}

