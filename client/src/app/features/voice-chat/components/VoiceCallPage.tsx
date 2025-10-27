import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { VoiceChatStatus } from '../../../../types/voice-chat';
import { useAudioRecorder } from '../../../../hooks/useAudioRecorder';
import { Animation } from './Animation';
import { VolumeVisualizer } from './VolumeVisualizer';
import './VoiceCallPage.css';

const HANG_UP_SVG = '/assets/hang-up.svg';

export function VoiceCallPage() {
  const navigate = useNavigate();
  const [voiceChatStatus, setVoiceChatStatus] = useState<VoiceChatStatus>(VoiceChatStatus.CALLING);
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listeningStartedRef = useRef<boolean>(false);
  
  const { 
    startListening, 
    stopListening, 
    isConnected, 
    response,
    audioStatus,
    currentVolume,
    error,
    analyser,
    reconnect,
    clearResponse,
  } = useAudioRecorder({
    serverUrl: 'http://localhost:3002',
    silenceThreshold: 1500,
    volumeThreshold: 1.5,
    chunkInterval: 500,
    enableWebSocket: true,
  });

  // 连接状态管理
  useEffect(() => {
    if (!isConnected) {
      setVoiceChatStatus(error ? VoiceChatStatus.SERVER_ERROR : VoiceChatStatus.CALLING);
      listeningStartedRef.current = false;
    } else if (!listeningStartedRef.current) {
      // 连接成功后的欢迎流程
      const welcomeTimer = setTimeout(() => {
        setVoiceChatStatus(VoiceChatStatus.WELCOME);
        
        const listeningTimer = setTimeout(() => {
          setVoiceChatStatus(VoiceChatStatus.LISTENING);
          startListening();
          listeningStartedRef.current = true;
        }, 1500);
        
        return () => clearTimeout(listeningTimer);
      }, 300);
      
      return () => clearTimeout(welcomeTimer);
    }
  }, [isConnected, error, startListening]);

  // 录音状态反馈
  useEffect(() => {
    if (audioStatus === 'recording' && voiceChatStatus !== VoiceChatStatus.LISTENING) {
      setVoiceChatStatus(VoiceChatStatus.LISTENING);
    }
  }, [audioStatus, voiceChatStatus]);

  // 响应处理 - 优化状态转换
  useEffect(() => {
    if (response) {
      // 清除之前的说话定时器
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }

      // 快速切换到思考状态
      setVoiceChatStatus(VoiceChatStatus.THINKING);
      
      // 短暂思考后开始说话
      const thinkingTimer = setTimeout(() => {
        setVoiceChatStatus(VoiceChatStatus.SPEAKING);
        
        // 根据响应长度动态计算说话时间
        const speakingDuration = response.duration || Math.max(2000, response.text.length * 50);
        
        speakingTimeoutRef.current = setTimeout(() => {
          setVoiceChatStatus(VoiceChatStatus.LISTENING);
          clearResponse(); // 清除响应
        }, speakingDuration);
      }, 300);

      return () => {
        clearTimeout(thinkingTimer);
        if (speakingTimeoutRef.current) {
          clearTimeout(speakingTimeoutRef.current);
        }
      };
    }
  }, [response, clearResponse]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
    };
  }, []);

  const hangUp = useCallback(() => {
    stopListening();
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
    }
    navigate('/ai-chat');
  }, [navigate, stopListening]);

  // 打断当前对话，立即回到监听状态
  const interruptAndListen = useCallback(() => {
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
    }
    clearResponse();
    setVoiceChatStatus(VoiceChatStatus.LISTENING);
    if (!listeningStartedRef.current) {
      startListening();
      listeningStartedRef.current = true;
    }
  }, [startListening, clearResponse]);

  // 重新连接
  const handleReconnect = useCallback(() => {
    setVoiceChatStatus(VoiceChatStatus.RECONECTING);
    reconnect();
  }, [reconnect]);

  const handleScreenClick = useCallback(() => {
    // 在欢迎、思考、说话状态时可以打断
    if ([VoiceChatStatus.WELCOME, VoiceChatStatus.THINKING, VoiceChatStatus.SPEAKING].includes(voiceChatStatus)) {
      interruptAndListen();
    }
    // 错误状态时重连
    else if (voiceChatStatus === VoiceChatStatus.SERVER_ERROR) {
      handleReconnect();
    }
  }, [voiceChatStatus, interruptAndListen, handleReconnect]);

  const showVolumeVisualizer = voiceChatStatus === VoiceChatStatus.LISTENING && audioStatus === 'recording';

  return (
    <div className="voice-call-page" onClick={handleScreenClick}>
      <div className="header">
        <div className="title">AI助手</div>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">
            {error ? '连接失败' : isConnected ? '已连接' : '连接中...'}
          </span>
        </div>
      </div>
      
      <Animation status={voiceChatStatus} volume={currentVolume} />
      
      {response && voiceChatStatus !== VoiceChatStatus.LISTENING && (
        <div className="response-bubble">
          <p className="response-text">{response.text}</p>
          <span className="response-time">
            {new Date(response.timestamp).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
      )}
      
      {/* 实时音量可视化 */}
      <VolumeVisualizer analyser={analyser} isActive={showVolumeVisualizer} />
      
      {/* 提示文字 */}
      {voiceChatStatus === VoiceChatStatus.LISTENING && (
        <div className="hint-text">
          {audioStatus === 'recording' ? '正在录音...' : '请说话'}
        </div>
      )}
      
      {[VoiceChatStatus.THINKING, VoiceChatStatus.SPEAKING].includes(voiceChatStatus) && (
        <div className="interrupt-hint">
          点击屏幕可以打断
        </div>
      )}
      
      {voiceChatStatus === VoiceChatStatus.SERVER_ERROR && (
        <div className="error-hint">
          连接失败，点击屏幕重试
        </div>
      )}
      
      <div className="controls">
        <button 
          className="hang-up-button"
          onClick={(e) => {
            e.stopPropagation();
            hangUp();
          }}
        >
          <img src={HANG_UP_SVG} alt="hang up" className="hang-up-icon" />
        </button>
      </div>
    </div>
  );
}

