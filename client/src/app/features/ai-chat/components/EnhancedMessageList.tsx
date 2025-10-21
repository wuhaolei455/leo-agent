import { useEffect, useRef, useDeferredValue, useMemo, memo } from 'react'
import { ChatMessage } from '../types'
import './MessageList.css'

interface MessageListProps {
  messages: ChatMessage[]
  isPending?: boolean // 是否有低优先级更新正在进行
}

/**
 * 增强版消息列表 - 整合多种 Fiber 优化思想
 * 
 * 优化策略：
 * 1. useDeferredValue: 延迟流式消息渲染
 * 2. React.memo: 避免不必要的消息重渲染
 * 3. useMemo: 缓存消息列表
 * 4. 虚拟滚动: 只渲染可见消息（可选）
 */
export function EnhancedMessageList({ messages, isPending = false }: MessageListProps) {
  const listRef = useRef<HTMLDivElement | null>(null)
  
  // 🎯 Fiber 优先级调度：延迟流式消息更新
  const deferredMessages = useDeferredValue(messages)
  
  // 检测是否正在流式输出
  const isStreaming = messages !== deferredMessages

  // 缓存渲染结果，避免不必要的重渲染
  const messageElements = useMemo(() => {
    return deferredMessages.map(message => (
      <MessageItem key={message.id} message={message} />
    ))
  }, [deferredMessages])

  // 自动滚动到底部
  useEffect(() => {
    if (!listRef.current) return
    
    // 流式输出时使用平滑滚动，否则立即跳转
    listRef.current.scrollTo({ 
      top: listRef.current.scrollHeight, 
      behavior: isStreaming ? 'smooth' : 'auto' 
    })
  }, [deferredMessages, isStreaming])

  return (
    <div className="message-list" ref={listRef}>
      {messageElements}
      
      {/* 优先级指示器 */}
      {(isStreaming || isPending) && (
        <div className="message-list__priority-indicator">
          <div className="message-list__priority-indicator-dot" />
          <span>后台更新中（不影响您的操作）</span>
        </div>
      )}
    </div>
  )
}

/**
 * 单个消息组件 - 使用 React.memo 优化
 * 
 * memo 的作用：
 * - 只有当 message 真正改变时才重新渲染
 * - 避免父组件重渲染时触发所有子组件渲染
 * - 类似 Fiber 的 bailout 优化
 */
const MessageItem = memo(function MessageItem({ 
  message 
}: { 
  message: ChatMessage 
}) {
  return (
    <div className={`message-list__item message-list__item--${message.role}`}>
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
  )
}, (prevProps, nextProps) => {
  // 🎯 自定义比较逻辑：只有这些字段变化时才重新渲染
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.status === nextProps.message.status
  )
})

/**
 * 使用示例：
 * 
 * import { usePriorityChat } from '../hooks/usePriorityChat'
 * import { EnhancedMessageList } from './EnhancedMessageList'
 * 
 * function ChatPanel() {
 *   const { messages, isPending, sendMessage } = usePriorityChat()
 *   
 *   return (
 *     <div>
 *       <EnhancedMessageList messages={messages} isPending={isPending} />
 *       <input onSubmit={sendMessage} />
 *     </div>
 *   )
 * }
 */

