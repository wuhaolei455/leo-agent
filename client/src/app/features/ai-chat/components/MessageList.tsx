import { useEffect, useRef } from 'react'

import { ChatMessage } from '../types'

import './MessageList.css'

interface MessageListProps {
  messages: ChatMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  const listRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const isAutoScrollEnabled = useRef(true)
  const lastMessageContent = useRef('')

  // 滚动到底部的函数
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (!isAutoScrollEnabled.current) return
    
    // 优先使用bottomRef的scrollIntoView（更可靠）
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior, block: 'end' })
    } else if (listRef.current) {
      // 备用方案：直接滚动容器
      const scrollContainer = listRef.current.parentElement
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  // 检测用户是否手动滚动
  useEffect(() => {
    const scrollContainer = listRef.current?.parentElement
    if (!scrollContainer) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
      isAutoScrollEnabled.current = isAtBottom
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [])

  // 监听消息变化（新消息或内容更新）
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    const currentContent = lastMessage ? lastMessage.content : ''
    
    // 检测是否有新消息或内容变化
    const hasNewContent = currentContent !== lastMessageContent.current
    lastMessageContent.current = currentContent

    if (hasNewContent) {
      // 流式更新时使用auto行为，避免过度动画
      const isStreaming = lastMessage?.status === 'streaming'
      scrollToBottom(isStreaming ? 'auto' : 'smooth')
    }
  }, [messages])

  // 初始加载时滚动到底部
  useEffect(() => {
    scrollToBottom('auto')
  }, [])

  return (
    <div className="message-list" ref={listRef}>
      {messages.map(message => (
        <div key={message.id} className={`message-list__item message-list__item--${message.role}`}>
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
      ))}
      {/* 底部锚点，用于滚动定位 */}
      <div ref={bottomRef} style={{ height: '1px', marginTop: '-1px' }} />
    </div>
  )
}
