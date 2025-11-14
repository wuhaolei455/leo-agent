import { startTransition, useCallback, useEffect, useRef } from 'react'
import { HollySSE } from 'holly-sse'

import { useChatContext } from '../contexts/ChatContext'
import { ChatMessage } from '../types/ai-chat'

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location
    return `${protocol}//${hostname}:3002`
  }
  return 'http://localhost:3002'
}

export function useAiChat() {
  const { state, dispatch } = useChatContext()
  const sseClientRef = useRef<HollySSE | null>(null)

  const sendMessage = useCallback(async (message?: string) => {
    const content = message?.trim() || ''
    if (!content) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      status: 'idle',
      createdAt: Date.now()
    }
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage })

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

    let accumulatedContent = ''

    try {
      const apiUrl = getApiBaseUrl()
      const client = new HollySSE(`${apiUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        payload: JSON.stringify({ prompt: content }),
        autoReconnect: false,
        
        onMessage: (event) => {
          const chunk = event.data
          if (chunk === '[DONE]') return
          
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
          sseClientRef.current = null
        },
        
        onError: (event) => {
          const errorMessage = event.error.message || '未知错误'
          startTransition(() => {
            dispatch({
              type: 'UPDATE_MESSAGE_STATUS',
              payload: { id: assistantMessageId, status: 'error' }
            })
            dispatch({ type: 'SET_ERROR', payload: errorMessage })
            dispatch({ type: 'SET_STREAMING', payload: false })
          })
          sseClientRef.current = null
        },
        
        onOpen: () => console.log('SSE 连接已建立'),
        onClose: () => console.log('SSE 连接已关闭')
      })

      sseClientRef.current = client
      await client.start()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '发送失败'
      dispatch({
        type: 'UPDATE_MESSAGE_STATUS',
        payload: { id: assistantMessageId, status: 'error' }
      })
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      dispatch({ type: 'SET_STREAMING', payload: false })
      sseClientRef.current = null
    }
  }, [dispatch])

  const stopStreaming = useCallback(async () => {
    if (sseClientRef.current) {
      await sseClientRef.current.stop()
      sseClientRef.current = null
      dispatch({ type: 'SET_STREAMING', payload: false })
    }
  }, [dispatch])

  const resetChat = useCallback(() => {
    stopStreaming()
    dispatch({ type: 'RESET_CHAT' })
  }, [dispatch, stopStreaming])

  useEffect(() => {
    return () => {
      if (sseClientRef.current) {
        sseClientRef.current.stop()
      }
    }
  }, [])

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
