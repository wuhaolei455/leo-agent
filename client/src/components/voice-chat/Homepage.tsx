import React from 'react'
import { useVoiceChat } from '../../hooks/useVoiceChat'
import './Homepage.css'

const Homepage: React.FC = () => {
  const { voiceChatStatus, hangUp } = useVoiceChat()

  const getStatusText = () => {
    switch (voiceChatStatus) {
      case 0: return '拨通中'
      case 1: return '欢迎'
      case 2: return '思考中'
      case 3: return '说话中'
      case 4: return '正在听'
      case 5: return '网络错误'
      case 6: return '服务器错误'
      case 7: return '重新连接中'
      default: return '未知状态'
    }
  }

  return (
    <div className="voice-homepage">
      <div className="title">小猿</div>
      <div className="status-text">{getStatusText()}</div>
      <button onClick={hangUp} className="hang-up-btn">挂断</button>
    </div>
  )
}

export default Homepage