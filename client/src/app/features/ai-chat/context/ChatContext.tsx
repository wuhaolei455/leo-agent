import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react'

import { ChatMessage } from '../types'

// ============ 状态类型定义 ============
export interface ChatState {
  messages: ChatMessage[]
  isStreaming: boolean
  error: string | null
  remainQuota: number
}

// ============ Action 类型定义 ============
export type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; content: string } }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { id: string; status: ChatMessage['status'] } }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REMAIN_QUOTA'; payload: number }
  | { type: 'RESET_CHAT' }

// ============ Reducer ============
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null
      }
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, content: action.payload.content }
            : msg
        )
      }
    
    case 'UPDATE_MESSAGE_STATUS':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, status: action.payload.status }
            : msg
        )
      }
    
    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isStreaming: false }
    
    case 'SET_REMAIN_QUOTA':
      return { ...state, remainQuota: action.payload }
    
    case 'RESET_CHAT':
      return {
        ...initialState,
        remainQuota: state.remainQuota
      }
    
    default:
      return state
  }
}

// ============ 初始状态 ============
const SYSTEM_GREETING: ChatMessage = {
  id: 'system-greeting',
  role: 'assistant',
  content: '你好，我是Stream AI，有什么可以帮你？',
  status: 'idle',
  createdAt: Date.now()
}

const initialState: ChatState = {
  messages: [SYSTEM_GREETING],
  isStreaming: false,
  error: null,
  remainQuota: 20
}

// ============ Context ============
interface ChatContextValue {
  state: ChatState
  dispatch: Dispatch<ChatAction>
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

// ============ Provider ============
interface ChatProviderProps {
  children: ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  )
}

// ============ Hook ============
export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider')
  }
  return context
}

