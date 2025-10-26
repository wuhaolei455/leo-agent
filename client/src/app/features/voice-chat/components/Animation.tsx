import { VoiceChatStatus } from '../../../../types/voice-chat';
import { useEffect, useRef } from 'react';
import './Animation.css';

interface AnimationProps {
  status: VoiceChatStatus;
  volume?: number;
}

export function Animation({ status, volume = 0 }: AnimationProps) {
  const circleRef = useRef<HTMLDivElement>(null);
  const getStatusText = () => {
    switch (status) {
      case VoiceChatStatus.CALLING:
        return '正在连接...';
      case VoiceChatStatus.WELCOME:
        return '你好，我是AI助手';
      case VoiceChatStatus.THINKING:
        return '思考中...';
      case VoiceChatStatus.SPEAKING:
        return '正在回答';
      case VoiceChatStatus.LISTENING:
        return '我在听，请说话';
      case VoiceChatStatus.NETWORK_ERROR:
        return '网络错误，请检查网络';
      case VoiceChatStatus.SERVER_ERROR:
        return '服务器错误，点击重试';
      case VoiceChatStatus.RECONECTING:
        return '重新连接中...';
      default:
        return '';
    }
  };

  const getAnimationClass = () => {
    switch (status) {
      case VoiceChatStatus.CALLING:
      case VoiceChatStatus.RECONECTING:
        return 'animation-pulse';
      case VoiceChatStatus.THINKING:
        return 'animation-thinking';
      case VoiceChatStatus.SPEAKING:
        return 'animation-speaking';
      case VoiceChatStatus.LISTENING:
        return 'animation-listening';
      case VoiceChatStatus.NETWORK_ERROR:
      case VoiceChatStatus.SERVER_ERROR:
        return 'animation-error';
      default:
        return '';
    }
  };

  // 根据音量调整动画强度
  useEffect(() => {
    if (circleRef.current && status === VoiceChatStatus.LISTENING && volume > 0) {
      const normalizedVolume = Math.min(volume / 10, 1); // 归一化到 0-1
      const scale = 1 + normalizedVolume * 0.15; // 1.0 到 1.15 的缩放
      const shadowIntensity = 20 + normalizedVolume * 40; // 20px 到 60px 的阴影
      
      circleRef.current.style.transform = `scale(${scale})`;
      circleRef.current.style.boxShadow = `0 0 ${shadowIntensity}px rgba(102, 126, 234, ${0.3 + normalizedVolume * 0.4})`;
      circleRef.current.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
    } else if (circleRef.current) {
      circleRef.current.style.transform = '';
      circleRef.current.style.boxShadow = '';
      circleRef.current.style.transition = '';
    }
  }, [volume, status]);

  return (
    <div className="animation-container">
      <div 
        ref={circleRef}
        className={`animation-circle ${getAnimationClass()}`}
      >
        <div className="animation-inner-circle" />
      </div>
      <div className="animation-status-text">{getStatusText()}</div>
    </div>
  );
}

