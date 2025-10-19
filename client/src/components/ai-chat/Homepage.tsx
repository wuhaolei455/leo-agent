import React from 'react'
import { useAiChat } from '../../hooks/useAiChat'
import MessageBubble from './components/MessageBubble'
import InputContainer from './components/InputContainer'
import './Homepage.css'

const Homepage: React.FC = () => {
  const {
    messageList,
    userInput,
    setUserInput,
    isLoading,
    remainTimes,
    sendMessage
  } = useAiChat()

  const bubbleKey = (msg: any, index: number) => {
    if (msg.type === 'cant-answer-feedback') {
      return 'cant-answer-feedback' + index
    }
    return msg.messageId + 'chat' + index
  }

  return (
    <div className="homepage">
      <div className="content">
        <div className="message-list">
          {messageList.map((msg, index) => (
            <MessageBubble
              key={bubbleKey(msg, index)}
              msg={msg}
              index={index}
              type="chat"
            />
          ))}
        </div>

        <InputContainer
          userInput={userInput}
          setUserInput={setUserInput}
          onSend={sendMessage}
          isLoading={isLoading}
          remainTimes={remainTimes}
        />
      </div>
    </div>
  )
}

export default Homepage