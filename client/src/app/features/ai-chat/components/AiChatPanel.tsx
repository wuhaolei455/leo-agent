import { useState } from 'react'

import { useAiChat } from '../hooks/useAiChat'
import { TitleBar } from './TitleBar'
import { MessageList } from './MessageList'
import { MessageComposer } from './MessageComposer'

import './AiChatPanel.css'

export function AiChatPanel() {
  const chat = useAiChat()
  const [userInput, setUserInput] = useState('')

  const handleSend = () => {
    if (!userInput.trim() || chat.isStreaming) {
      return
    }
    chat.sendMessage(userInput)
    setUserInput('')
  }

  return (
    <div className="ai-chat-panel">
      <TitleBar />

      <div className="ai-chat-panel__content">
        <MessageList messages={chat.messages} />
      </div>

      <div className="ai-chat-panel__composer">
        <MessageComposer
          userInput={userInput}
          setUserInput={setUserInput}
          onSend={handleSend}
          isLoading={chat.isStreaming}
          remainTimes={chat.remainQuota}
        />
      </div>
    </div>
  )
}
