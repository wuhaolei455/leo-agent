import React, { useState, useRef, useEffect } from 'react'
import { IMessage, STATUS, PlayStatus, FeedbackType } from '../../../types/ai-chat'
import './MessageBubble.css'

interface MessageBubbleProps {
  msg: IMessage
  index: number
  type: string
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, index, type }) => {
  const [audioPlaying, setAudioPlaying] = useState(false)
  const bubbleRef = useRef<HTMLDivElement>(null)

  const isAssistant = msg.role === 'assistant'
  const isLastAnswer = type === 'chat' && index === 0 // 简化的判断逻辑

  const handlePlay = () => {
    setAudioPlaying(!audioPlaying)
    // 实现音频播放逻辑
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content)
  }

  const handleLike = () => {
    // 实现点赞逻辑
  }

  const handleDislike = () => {
    // 实现点踩逻辑
  }

  const handleRetry = () => {
    // 实现重试逻辑
  }

  if (msg.type === 'cant-answer-feedback') {
    return (
      <div className="cant-answer-feedback">
        {/* 无法回答反馈组件 */}
        <div>抱歉，我无法回答这个问题</div>
      </div>
    )
  }

  return (
    <div className="message-bubble">
      <div
        ref={bubbleRef}
        className={`message ${msg.role}-message`}
      >
        {msg.content && (
          <div className="msg-content">
            <div className="msg-text">{msg.content}</div>
            {msg.status === STATUS.LOADING && <div className="progress"></div>}
          </div>
        )}

        {isAssistant && msg.content && (
          <div className="operation-bar">
            <div className="divider"></div>
            <div className="operation-list">
              <div className="read" onClick={handlePlay}>
                <img
                  className="play-btn"
                  src={audioPlaying ? "/assets/pause.png" : "/assets/play.png"}
                  alt=""
                />
                <div className="loading-lottie" style={{ display: msg.playStatus === PlayStatus.LOADING ? 'block' : 'none' }}>
                  {/* Loading animation */}
                </div>
              </div>
              <div className="copy" onClick={handleCopy}>
                <img src="/assets/copy-icon.png" alt="" />
              </div>
              <div className="like" onClick={handleLike}>
                <img src="/assets/like-icon.png" alt="" />
              </div>
              <div className="dislike" onClick={handleDislike}>
                <img src="/assets/dislike-icon.png" alt="" />
              </div>
            </div>
          </div>
        )}

        {msg.status === STATUS.INTERRUPT && (
          <div className="interrupt">
            <div className="divider"></div>
            <div className="retry" onClick={handleRetry}>
              <img src="/assets/retry.png" alt="" />
              <div>抱歉，回复异常，请重试</div>
            </div>
          </div>
        )}

        {!msg.content && (
          <div className="loading">
            <div className="loading-lottie">
              {/* Loading animation */}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBubble