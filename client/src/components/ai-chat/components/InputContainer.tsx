import React, { useState, useRef, useEffect } from 'react'
import VoiceRecord from './VoiceRecord'
import './InputContainer.css'

interface InputContainerProps {
  userInput: string
  setUserInput: (input: string) => void
  onSend: (message?: string) => void
  isLoading: boolean
  remainTimes: number
}

const InputContainer: React.FC<InputContainerProps> = ({
  userInput,
  setUserInput,
  onSend,
  isLoading,
  remainTimes
}) => {
  const [isShowVoice, setIsShowVoice] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const inputDisable = remainTimes <= 0 && !isLoading

  const hasText = (content: string) => {
    return !/^(\s|<br>|&nbsp;|\n|\r| )+$/g.test(content) && content !== ''
  }

  const adjustHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = '24px'
      if (userInput) {
        inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
      }
    }
    if (userInput.length > 200) {
      setUserInput(userInput.slice(0, 200))
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [userInput])

  useEffect(() => {
    if (remainTimes <= 0) {
      setUserInput('')
      adjustHeight()
    }
  }, [remainTimes])

  const handleSend = () => {
    onSend()
  }

  const handleVoiceToggle = () => {
    if (remainTimes <= 0) return
    setIsShowVoice(!isShowVoice)
  }

  const handleVoiceSend = (message: string) => {
    onSend(message)
  }

  if (inputDisable) {
    return (
      <div className="input-container">
        <div className="disable-text">
          <div>今日问答已达上限</div>
          <div>明天再来吧</div>
        </div>
      </div>
    )
  }

  if (isShowVoice) {
    return (
      <div className="input-container">
        <VoiceRecord
          value={isShowVoice}
          onUpdateValue={setIsShowVoice}
          onHandleVoice={handleVoiceSend}
          remainTimes={remainTimes}
        />
      </div>
    )
  }

  return (
    <div className="input-container">
      <div className="user-input">
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="textarea"
          placeholder="有问题尽管问小猿"
          disabled={inputDisable}
        />
        {hasText(userInput) && !isLoading ? (
          <img
            src="/assets/send-icon.png"
            className="send"
            onClick={handleSend}
            alt="发送"
          />
        ) : hasText(userInput) && isLoading ? (
          <img src="/assets/send-disable-icon.png" className="send" alt="发送中" />
        ) : (
          <img
            src="/assets/voice-input-icon.png"
            alt="语音输入"
            className="voice-input"
            onClick={handleVoiceToggle}
          />
        )}
      </div>
    </div>
  )
}

export default InputContainer