import { useState, useCallback } from 'react'
import { IMessage, STATUS, PlayStatus } from '../types/ai-chat'

interface UseAiChatReturn {
  messageList: IMessage[]
  userInput: string
  setUserInput: (input: string) => void
  isLoading: boolean
  remainTimes: number
  sessionId: string
  sendMessage: (message?: string) => void
  retry: () => void
  longPressId: string
  setLongPressId: (id: string) => void
  showFeedbackPopUp: boolean
  showRemainTimes: boolean
  inputContainerHeight: number
  fixTop: boolean
  audioEnable: boolean
  scrollToBottom: () => void
  getHistory: () => Promise<any>
  getVoiceHistory: () => Promise<any>
  pauseAllAudio: () => void
  playHelloAudio: () => void
  getRecommend: () => Promise<any>
  getRemainTimes: () => Promise<any>
  operationFuncs: {
    read: (msg: IMessage) => void
    copy: (content: string) => void
    like: (msg: IMessage) => void
    dislike: (msg: IMessage) => void
  }
}

export const useAiChat = (): UseAiChatReturn => {
  const [messageList, setMessageList] = useState<IMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [remainTimes, setRemainTimes] = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [longPressId, setLongPressId] = useState('')
  const [showFeedbackPopUp, setShowFeedbackPopUp] = useState(false)
  const [showRemainTimes, setShowRemainTimes] = useState(false)
  const [inputContainerHeight, setInputContainerHeight] = useState(82)
  const [fixTop, setFixTop] = useState(false)
  const [audioEnable, setAudioEnable] = useState(true)

  const scrollToBottom = useCallback(() => {
    // 实现滚动到底部的逻辑
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    })
  }, [])

  const getHistory = useCallback(async () => {
    // 实现获取历史记录的逻辑
    return { sessionList: [] }
  }, [])

  const getVoiceHistory = useCallback(async () => {
    // 实现获取语音历史记录的逻辑
    return { sessionList: [] }
  }, [])

  const pauseAllAudio = useCallback(() => {
    // 实现暂停所有音频的逻辑
  }, [])

  const playHelloAudio = useCallback(() => {
    // 实现播放问候音频的逻辑
  }, [])

  const getRecommend = useCallback(async () => {
    // 实现获取推荐问题的逻辑
  }, [])

  const getRemainTimes = useCallback(async () => {
    // 实现获取剩余次数的逻辑
  }, [])

  const sendMessage = useCallback((message?: string) => {
    const content = message || userInput
    if (!content.trim()) return

    const newMessage: IMessage = {
      content,
      feedbackType: 0,
      messageId: Date.now().toString(),
      role: 'user',
      status: STATUS.LOADING,
      type: 'text'
    }

    setMessageList(prev => [...prev, newMessage])
    setUserInput('')
    setIsLoading(true)

    // 模拟发送消息
    setTimeout(() => {
      const aiMessage: IMessage = {
        content: `这是对"${content}"的回复`,
        feedbackType: 0,
        messageId: (Date.now() + 1).toString(),
        role: 'assistant',
        status: STATUS.DONE,
        type: 'text',
        playStatus: PlayStatus.NONE
      }
      setMessageList(prev => [...prev.slice(0, -1), { ...prev[prev.length - 1], status: STATUS.DONE }, aiMessage])
      setIsLoading(false)
    }, 2000)
  }, [userInput])

  const retry = useCallback(() => {
    // 实现重试逻辑
  }, [])

  const operationFuncs = {
    read: useCallback((msg: IMessage) => {
      // 实现阅读消息的逻辑
    }, []),
    copy: useCallback((content: string) => {
      navigator.clipboard.writeText(content)
    }, []),
    like: useCallback((msg: IMessage) => {
      // 实现点赞逻辑
    }, []),
    dislike: useCallback((msg: IMessage) => {
      // 实现点踩逻辑
    }, [])
  }

  return {
    messageList,
    userInput,
    setUserInput,
    isLoading,
    remainTimes,
    sessionId,
    sendMessage,
    retry,
    longPressId,
    setLongPressId,
    showFeedbackPopUp,
    showRemainTimes,
    inputContainerHeight,
    fixTop,
    audioEnable,
    scrollToBottom,
    getHistory,
    getVoiceHistory,
    pauseAllAudio,
    playHelloAudio,
    getRecommend,
    getRemainTimes,
    operationFuncs
  }
}