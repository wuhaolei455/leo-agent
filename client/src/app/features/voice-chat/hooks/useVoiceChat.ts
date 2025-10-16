import { useEffect, useState } from 'react'

import { VoiceChatStatus } from '../types'

interface UseVoiceChatReturn {
  voiceChatStatus: VoiceChatStatus
  hangUp: () => void
}

export function useVoiceChat(): UseVoiceChatReturn {
  const [voiceChatStatus, setVoiceChatStatus] = useState<VoiceChatStatus>(VoiceChatStatus.WELCOME)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVoiceChatStatus(VoiceChatStatus.LISTENING)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const hangUp = () => {
    setVoiceChatStatus(VoiceChatStatus.WELCOME)
  }

  return {
    voiceChatStatus,
    hangUp
  }
}


