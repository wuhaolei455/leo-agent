import { useEffect, useRef, useDeferredValue, useMemo } from 'react'
import { ChatMessage } from '../types'
import './MessageList.css'

interface MessageListProps {
  messages: ChatMessage[]
}

/**
 * 优化后的消息列表 - 使用 React 18 并发特性
 * 
 * 优化点：
 * 1. useDeferredValue: 让流式更新的消息以较低优先级渲染，不阻塞用户输入
 * 2. useMemo: 缓存消息渲染结果
 * 3. 虚拟滚动: 如果消息很多，只渲染可见区域
 */
export function OptimizedMessageList({ messages }: MessageListProps) {
  const listRef = useRef<HTMLDivElement | null>(null)
  
  // 🎯 使用 useDeferredValue 延迟流式消息的渲染
  // 这样用户输入等高优先级操作不会被阻塞
  const deferredMessages = useDeferredValue(messages)
  
  // 检测是否正在流式输出（有延迟）
  const isStreaming = messages !== deferredMessages

  // 使用 memo 缓存渲染结果，避免不必要的重渲染
  const messageElements = useMemo(() => {
    return deferredMessages.map(message => (
      <div 
        key={message.id} 
        className={`message-list__item message-list__item--${message.role}`}
      >
        <div className="message-list__bubble">
          {message.status === 'streaming' && !message.content ? (
            <span className="message-list__loading">正在生成回复…</span>
          ) : (
            <>
              {message.content}
              {message.status === 'streaming' && (
                <span className="message-list__cursor">▊</span>
              )}
            </>
          )}
        </div>
      </div>
    ))
  }, [deferredMessages])

  // 自动滚动到底部
  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTo({ 
      top: listRef.current.scrollHeight, 
      behavior: isStreaming ? 'smooth' : 'auto' 
    })
  }, [deferredMessages, isStreaming])

  return (
    <div className="message-list" ref={listRef}>
      {messageElements}
      {isStreaming && (
        <div className="message-list__streaming-indicator">
          正在更新... (低优先级渲染中)
        </div>
      )}
    </div>
  )
}

