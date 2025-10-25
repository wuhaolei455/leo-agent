import { useVoiceChat } from '../hooks/useVoiceChat'
import { VoiceChatStatusBadge } from './VoiceChatStatusBadge'
import './VoiceChatPanel.css'

export function VoiceChatPanel() {
  const voiceChat = useVoiceChat()

  return (
    <div className="voice-chat-panel">
      <div className="voice-chat-panel__status">
        <VoiceChatStatusBadge status={voiceChat.voiceChatStatus} />
      </div>
      <div className="voice-chat-panel__actions">
        <button
          type="button"
          className="voice-chat-panel__hangup"
          onClick={voiceChat.hangUp}
        >
          挂断对话
        </button>
      </div>
    </div>
  )
}


