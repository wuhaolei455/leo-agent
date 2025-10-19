export type ChatMessageRole = 'user' | 'assistant' | 'system'

export type ChatMessageStatus = 'idle' | 'pending' | 'streaming' | 'error'

export interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: string
  status: ChatMessageStatus
  createdAt: number
}

export interface UseAiChatState {
  messageList: ChatMessage[]
  userInput: string
  isLoading: boolean
  remainQuota: number
}


