import { useEffect, useState } from 'react'
import { VoiceChatStatus } from '../types'
import { useNavigate } from 'react-router-dom'

interface UseVoiceChatReturn {
  voiceChatStatus: VoiceChatStatus
  hangUp: () => void
}

export function useVoiceChat(): UseVoiceChatReturn {
  const [voiceChatStatus, setVoiceChatStatus] = useState<VoiceChatStatus>(VoiceChatStatus.WELCOME)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setVoiceChatStatus(VoiceChatStatus.LISTENING)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const hangUp = () => {
    setVoiceChatStatus(VoiceChatStatus.WELCOME)
    navigate(-1)
  }

  return {
    voiceChatStatus,
    hangUp
  }
}


