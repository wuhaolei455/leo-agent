import { useEffect, useRef } from 'react'

import { ChatMessage } from '../types'

import './MessageList.css'

interface MessageListProps {
  messages: ChatMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!listRef.current) {
      return
    }
    listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

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
    </div>
  )
}
