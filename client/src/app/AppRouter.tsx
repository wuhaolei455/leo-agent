import { Navigate, Route, Routes } from 'react-router-dom'

import { AiChatPage } from './features/ai-chat/components/AiChatPage'
import { VoiceCallPage } from './features/voice-chat/components/VoiceCallPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/ai-chat" element={<AiChatPage />} />
      <Route path="/voice-chat" element={<VoiceCallPage />} />
      <Route path="/" element={<Navigate to="/ai-chat" replace />} />
      <Route path="*" element={<Navigate to="/ai-chat" replace />} />
    </Routes>
  )
}


