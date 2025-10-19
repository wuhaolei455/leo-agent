import { useState, useEffect, useCallback, useRef } from 'react'
import { VoiceChatStatus } from '../types/voice-chat'
import { IMessage } from '../types/ai-chat'

interface UseVoiceChatReturn {
  voiceChatStatus: VoiceChatStatus
  setVoiceChatStatus: (status: VoiceChatStatus) => void
  messageList: IMessage[]
  hangUp: () => void
  currentVoiceDetected: boolean
  showCountDown: boolean
  countDown: number
  sessionId: string
  isPageVisible: boolean
  captionRef: React.RefObject<HTMLDivElement | null>
  showCaptionWrapper: boolean
}

export const useVoiceChat = (): UseVoiceChatReturn => {
  const [voiceChatStatus, setVoiceChatStatus] = useState<VoiceChatStatus>(VoiceChatStatus.WELCOME)
  const [messageList, setMessageList] = useState<IMessage[]>([])
  const [currentVoiceDetected, setCurrentVoiceDetected] = useState(false)
  const [showCountDown, setShowCountDown] = useState(false)
  const [countDown, setCountDown] = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [showCaptionWrapper, setShowCaptionWrapper] = useState(false)

  const captionRef = useRef<HTMLDivElement>(null)

  const hangUp = useCallback(() => {
    // 实现挂断逻辑
    setVoiceChatStatus(VoiceChatStatus.WELCOME)
  }, [])

  useEffect(() => {
    // 初始化逻辑
    setVoiceChatStatus(VoiceChatStatus.WELCOME)
  }, [])

  return {
    voiceChatStatus,
    setVoiceChatStatus,
    messageList,
    hangUp,
    currentVoiceDetected,
    showCountDown,
    countDown,
    sessionId,
    isPageVisible,
    captionRef,
    showCaptionWrapper
  }
}