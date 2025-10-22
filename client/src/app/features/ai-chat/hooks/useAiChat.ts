import { startTransition, useCallback, useRef } from 'react'

import { useChatContext } from '../context/ChatContext'
import { streamChat } from '../services/streamService'
import { ChatMessage } from '../types'

export function useAiChat() {
  const { state, dispatch } = useChatContext()
  const cancelStreamRef = useRef<(() => void) | null>(null)

  const sendMessage = useCallback(async (message?: string) => {
    const content = message?.trim() || ''
    if (!content) {
      return
    }

    // 1. 添加用户消息
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      status: 'idle',
      createdAt: Date.now()
    }
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage })

    // 2. 创建 AI 回复占位消息
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
      // 3. 启动流式请求
      let accumulatedContent = ''
      
      const cancelFn = await streamChat(content, {
        onMessage: (chunk: string) => {
          accumulatedContent += chunk
          startTransition(() => {
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: { id: assistantMessageId, content: accumulatedContent }
            })
          })
        },
        onComplete: () => {
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
          startTransition(() => {
            dispatch({
              type: 'UPDATE_MESSAGE_STATUS',
              payload: { id: assistantMessageId, status: 'error' }
            })
            dispatch({ type: 'SET_ERROR', payload: error.message })
            dispatch({ type: 'SET_STREAMING', payload: false })
          })
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
    sendMessage,
    stopStreaming,
    resetChat
  }
}
