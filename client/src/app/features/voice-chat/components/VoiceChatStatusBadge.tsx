import { VoiceChatStatus } from '../types'

import './VoiceChatStatusBadge.css'

interface VoiceChatStatusBadgeProps {
  status: VoiceChatStatus
}

const STATUS_TEXT: Record<VoiceChatStatus, string> = {
  [VoiceChatStatus.CALLING]: '拨号中…',
  [VoiceChatStatus.WELCOME]: '欢迎加入语音对话',
  [VoiceChatStatus.THINKING]: '正在思考…',
  [VoiceChatStatus.SPEAKING]: 'AI 正在讲话',
  [VoiceChatStatus.LISTENING]: '请开始说话',
  [VoiceChatStatus.NETWORK_ERROR]: '网络出现问题，正在重试',
  [VoiceChatStatus.SERVER_ERROR]: '服务暂不可用',
  [VoiceChatStatus.RECONECTING]: '连接丢失，正在重连'
}

export function VoiceChatStatusBadge({ status }: VoiceChatStatusBadgeProps) {
  return (
    <div className={`voice-chat-status voice-chat-status--${status}`}>
      <div className="voice-chat-status__dot" />
      <span>{STATUS_TEXT[status]}</span>
    </div>
  )
}


