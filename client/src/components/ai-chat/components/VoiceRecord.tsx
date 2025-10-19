import React, { useState, useEffect, useCallback } from 'react'
import { useIntervalFn } from '../../../hooks/useIntervalFn'
import './VoiceRecord.css'

interface VoiceRecordProps {
  value: boolean
  onUpdateValue: (value: boolean) => void
  onHandleVoice: (message: string) => void
  remainTimes: number
}

const VoiceRecord: React.FC<VoiceRecordProps> = ({
  value,
  onUpdateValue,
  onHandleVoice,
  remainTimes
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isRealRecording, setIsRealRecording] = useState(false)
  const [isTouching, setIsTouching] = useState(false)
  const [countTime, setCountTime] = useState(30)
  const [moveInstance, setMoveInstance] = useState({ startY: 0, yMoveInstance: 0 })

  const MaxRecordTime = 30

  const { resume, pause } = useIntervalFn(() => {
    if (countTime > 0) {
      setCountTime(prev => prev - 1)
    } else {
      handleVoiceTouchEnd()
      pause()
    }
  })

  const isMoveCancel = moveInstance.yMoveInstance < -100
  const countingText = countTime <= 5 ? `${countTime}秒后将停止录音` : `00:${countTime.toString().padStart(2, '0')}`

  const handleStopRecording = useCallback(() => {
    setIsRecording(false)
    setIsRealRecording(false)
    // 停止录音逻辑
  }, [])

  const handleStartRecording = useCallback(async () => {
    try {
      // 检查麦克风权限
      if (!isTouching) return

      // 开始录音逻辑
      setIsRecording(true)
      setIsRealRecording(true)
      setCountTime(MaxRecordTime)
      resume()
    } catch (err) {
      console.log(err)
    }
  }, [isTouching, resume])

  const handleVoiceTouchStart = (e: React.TouchEvent) => {
    if (remainTimes <= 0) return
    setIsTouching(true)
    e.preventDefault()

    handleStartRecording()
    setMoveInstance({ startY: e.touches[0].pageY, yMoveInstance: 0 })
  }

  const handleVoiceTouchMove = (e: React.TouchEvent) => {
    if (remainTimes <= 0) return
    e.preventDefault()
    const yPosition = e.touches[0].pageY
    setMoveInstance(prev => ({
      ...prev,
      yMoveInstance: yPosition - prev.startY
    }))
  }

  const handleVoiceTouchEnd = () => {
    if (remainTimes <= 0) return
    setIsTouching(false)

    if (!isRecording) return

    if (isMoveCancel) {
      setIsRecording(false)
      setIsRealRecording(false)
      handleStopRecording()
      return
    }

    // 处理录音完成
    handleStopRecording()

    // 模拟语音转文字
    setTimeout(() => {
      onHandleVoice("这是语音转文字的结果")
    }, 1000)
  }

  const handleKeyboard = () => {
    if (remainTimes <= 0) return
    onUpdateValue(false)
  }

  if (isRecording) {
    return (
      <div className="record-container">
        <div className="recording">
          <div className="record-info">
            <div className={`counting ${countTime <= 5 ? 'warning' : ''}`}>
              {countingText}
            </div>
            <div className="voice-animation">
              {/* Voice animation */}
            </div>
          </div>
          <div className="record-btn-container">
            <div className="record">
              <div className="record-text">
                {isMoveCancel ? '松手取消' : '松手发送，上滑取消'}
              </div>
              <div className="voice-record"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="record-container">
      <div className="voice-input-container">
        <div className={`voice-input ${isTouching ? 'touching' : ''}`}>
          <div className="voice-text">
            {isTouching ? '松手发送' : '按住说话'}
          </div>
          <img
            className="keyboard"
            src="/assets/keyboard.png"
            alt="键盘"
            onClick={handleKeyboard}
          />
        </div>
      </div>
    </div>
  )
}

export default VoiceRecord