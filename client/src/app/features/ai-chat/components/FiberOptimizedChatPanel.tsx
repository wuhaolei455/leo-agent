import { useState } from 'react'
import { usePriorityChat } from '../hooks/usePriorityChat'
import { EnhancedMessageList } from './EnhancedMessageList'
import { MessageComposer } from './MessageComposer'
import '../components/AiChatPanel.css'

/**
 * 应用 Fiber 优化思想的完整聊天面板示例
 * 
 * 集成的优化：
 * 1. ✅ 优先级调度：usePriorityChat + useTransition
 * 2. ✅ 延迟渲染：useDeferredValue
 * 3. ✅ 缓存优化：React.memo
 * 4. ✅ 优先级指示器
 */
export function FiberOptimizedChatPanel() {
  const {
    messages,
    isStreaming,
    isPending,  // 🎯 从 usePriorityChat 获取的 transition pending 状态
    error,
    sendMessage,
    stopStreaming,
    resetChat
  } = usePriorityChat()

  const [inputValue, setInputValue] = useState('')

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return
    
    await sendMessage(inputValue)
    setInputValue('') // 清空输入框
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="ai-chat-panel">
      {/* 头部：显示状态和控制按钮 */}
      <div className="ai-chat-panel__header">
        <h2>AI Chat (Fiber 优化版)</h2>
        
        <div className="ai-chat-panel__status">
          {/* 🎯 优先级状态指示器 */}
          {isPending && (
            <span className="status-badge status-badge--pending">
              后台渲染中
            </span>
          )}
          {isStreaming && (
            <span className="status-badge status-badge--streaming">
              AI 正在回复
            </span>
          )}
        </div>

        <div className="ai-chat-panel__actions">
          {isStreaming && (
            <button onClick={stopStreaming} className="btn btn--secondary">
              停止生成
            </button>
          )}
          <button onClick={resetChat} className="btn btn--secondary">
            清空对话
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="ai-chat-panel__error">
          {error}
        </div>
      )}

      {/* 消息列表 - 使用增强版组件 */}
      <EnhancedMessageList 
        messages={messages} 
        isPending={isPending}  // 传递 pending 状态
      />

      {/* 输入框 */}
      <div className="ai-chat-panel__input">
        <textarea
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
          disabled={isStreaming}
          rows={3}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isStreaming}
          className="btn btn--primary"
        >
          {isStreaming ? '发送中...' : '发送'}
        </button>
      </div>

      {/* 性能提示 */}
      <div className="ai-chat-panel__footer">
        <small>
          💡 优化已启用：用户输入始终流畅，AI 流式更新不会阻塞交互
        </small>
      </div>
    </div>
  )
}

/**
 * 对比组件：未优化的版本（用于 A/B 测试）
 */
export function StandardChatPanel() {
  // 使用原始的 useAiChat（不包含优先级调度）
  // const { messages, isStreaming, ... } = useAiChat()
  
  // ... 相同的 UI 结构
  
  return (
    <div className="ai-chat-panel">
      {/* ... */}
      <div className="ai-chat-panel__footer">
        <small>
          ⚠️ 标准版本：流式输出时可能会卡顿
        </small>
      </div>
    </div>
  )
}

