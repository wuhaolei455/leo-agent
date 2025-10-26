import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VoiceChatStatus } from '../../../../types/voice-chat';
import { useAudioRecorder } from '../../../../hooks/useAudioRecorder';
import { Animation } from './Animation';
import './VoiceCallPage.css';

const LISTENING_SVG = '/assets/listening.svg';
const HANG_UP_SVG = '/assets/hang-up.svg';

export function VoiceCallPage() {
  const navigate = useNavigate();
  const [voiceChatStatus, setVoiceChatStatus] = useState<VoiceChatStatus>(VoiceChatStatus.CALLING);
  
  const { 
    startListening, 
    stopListening, 
    isConnected, 
    response,
    audioStatus,
  } = useAudioRecorder({
    serverUrl: 'http://localhost:3002',
    silenceThreshold: 1500,
    volumeThreshold: 1.5,
    chunkInterval: 500,
    enableWebSocket: true,
  });

  // 根据连接状态更新 UI
  useEffect(() => {
    if (!isConnected) {
      setVoiceChatStatus(VoiceChatStatus.CALLING);
    } else {
      const timer = setTimeout(() => {
        setVoiceChatStatus(VoiceChatStatus.WELCOME);
        setTimeout(() => {
          setVoiceChatStatus(VoiceChatStatus.LISTENING);
          startListening();
        }, 2000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, startListening]);

  // 根据录音状态更新 UI
  useEffect(() => {
    if (audioStatus === 'recording') {
      setVoiceChatStatus(VoiceChatStatus.LISTENING);
    }
  }, [audioStatus]);

  // 收到响应后显示回答状态
  useEffect(() => {
    if (response) {
      setVoiceChatStatus(VoiceChatStatus.THINKING);
      setTimeout(() => {
        setVoiceChatStatus(VoiceChatStatus.SPEAKING);
        // 模拟说话完成后回到监听状态
        setTimeout(() => {
          setVoiceChatStatus(VoiceChatStatus.LISTENING);
        }, 3000);
      }, 500);
    }
  }, [response]);

  const hangUp = useCallback(() => {
    stopListening();
    navigate('/ai-chat');
  }, [navigate, stopListening]);

  const breakChat = useCallback(() => {
    setVoiceChatStatus(VoiceChatStatus.LISTENING);
    startListening();
  }, [startListening]);

  const handleScreenClick = useCallback(() => {
    if ([VoiceChatStatus.WELCOME, VoiceChatStatus.THINKING, VoiceChatStatus.SPEAKING].includes(voiceChatStatus)) {
      breakChat();
    }
    if (voiceChatStatus === VoiceChatStatus.SERVER_ERROR) {
      setVoiceChatStatus(VoiceChatStatus.RECONECTING);
    }
  }, [voiceChatStatus, breakChat]);

  const showVoiceWave = voiceChatStatus === VoiceChatStatus.LISTENING;

  return (
    <div className="voice-call-page" onClick={handleScreenClick}>
      <div className="header">
        <div className="title">AI助手</div>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">{isConnected ? '已连接' : '连接中...'}</span>
        </div>
      </div>
      
      <Animation status={voiceChatStatus} />
      
      {response && (
        <div className="response-bubble">
          <p className="response-text">{response.text}</p>
          <span className="response-time">
            {new Date(response.timestamp).toLocaleTimeString('zh-CN')}
          </span>
        </div>
      )}
      
      {showVoiceWave && (
        <div className="voice-wave-container">
          <img className="listening" src={LISTENING_SVG} alt="listening" />
        </div>
      )}
      
      <img 
        src={HANG_UP_SVG}
        alt="hang up" 
        className="hang-up"
        onClick={(e) => {
          e.stopPropagation();
          hangUp();
        }}
      />
    </div>
  );
}

