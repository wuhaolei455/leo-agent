import { useNavigate } from 'react-router-dom'
import { useAutoSpeak } from '../../../../contexts/AutoSpeakContext'
import { VolumeOnIcon } from '../../../components/icons/VolumeOnIcon'
import { VolumeOffIcon } from '../../../components/icons/VolumeOffIcon'
import { PhoneIcon } from '../../../components/icons/PhoneIcon'

import './TitleBar.css'

export function TitleBar() {
  const navigate = useNavigate()
  const { autoSpeak, toggleAutoSpeak } = useAutoSpeak()

  return (
    <div className="title-bar">
      <h2 className="title-bar__title">AI 对话</h2>
      <div className="title-bar__actions">
        <button 
          className="title-bar__icon-btn" 
          onClick={toggleAutoSpeak}
          title={autoSpeak ? '关闭自动朗读' : '开启自动朗读'}
        >
          {autoSpeak ? <VolumeOnIcon size={24} /> : <VolumeOffIcon size={24} />}
        </button>
        <button 
          className="title-bar__icon-btn" 
          onClick={() => navigate('/voice-chat')}
          title="语音对话"
        >
          <PhoneIcon size={24} />
        </button>
      </div>
    </div>
  )
}

