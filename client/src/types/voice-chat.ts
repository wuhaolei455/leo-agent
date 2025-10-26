import { IAiCompanionChatMessage } from './ai-chat'

// 语音聊天状态
export enum VoiceChatStatus {
  CALLING,
  WELCOME,
  THINKING,
  SPEAKING,
  LISTENING,
  NETWORK_ERROR,
  SERVER_ERROR,
  RECONECTING,
}

export interface AiCompanionBreakCallRequest {
  messageId: string; // 消息ID
  position: number; // 打断位置
  sessionId: number; // 会话ID
}

export type IMessage = IAiCompanionChatMessage & {
  sessionId?: number
  lastEventId?: number
  hasAutoRetry?: boolean
  hasRetry?: boolean
  ttsList?: string[]
  ttsPartEnd?: boolean
  type?: string
}

// 录音状态
export interface AudioRecorderState {
  duration: number;
  audioUrl: string;
}

export enum RecorderStatus {
  IDLE = 'idle',
  RECORDING = 'recording',
  PAUSED = 'paused',
  STOPPED = 'stopped',
}

