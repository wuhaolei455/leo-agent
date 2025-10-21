import { useCallback, useRef, useTransition } from 'react'
import { useChatContext } from '../context/ChatContext'
import { streamChat } from '../services/streamService'
import { ChatMessage } from '../types'

/**
 * 基于 React Fiber 优先级调度思想的 Chat Hook
 * 
 * 核心优化：
 * 1. useTransition: 让流式更新以低优先级执行，不阻塞用户输入
 * 2. 用户消息立即显示（高优先级）
 * 3. AI 流式回复使用 startTransition 包裹（低优先级）
 */
export function usePriorityChat() {
  const { state, dispatch } = useChatContext()
  const cancelStreamRef = useRef<(() => void) | null>(null)
  
  // isPending 表示是否有低优先级更新正在进行
  const [isPending, startTransition] = useTransition()

  const sendMessage = useCallback(async (message?: string) => {
    const content = message?.trim() || ''
    if (!content) {
      return
    }

    // ⚡ 高优先级：用户消息立即添加（不包裹在 transition 中）
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      status: 'idle',
      createdAt: Date.now()
    }
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage })

    // 创建 AI 回复占位消息
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
      
      const cancelFn = await streamChat(content, {
        onMessage: (chunk: string) => {
          accumulatedContent += chunk
          
          // 🎯 低优先级：流式更新不阻塞用户交互
          startTransition(() => {
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: { id: assistantMessageId, content: accumulatedContent }
            })
          })
        },
        onComplete: () => {
          // 完成时也用 transition，保持一致性
          startTransition(() => {
            dispatch({
              type: 'UPDATE_MESSAGE_STATUS',
              payload: { id: assistantMessageId, status: 'idle' }
            })
            dispatch({ type: 'SET_STREAMING', payload: false })
          })
          cancelStreamRef.current = null
        },
        onError: (error: Error) => {
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
    isPending, // 暴露 pending 状态，可用于显示 loading 指示器
    sendMessage,
    stopStreaming,
    resetChat
  }
}

