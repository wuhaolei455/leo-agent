import { VoiceChatStatus } from '../../../../types/voice-chat';
import './Animation.css';

interface AnimationProps {
  status: VoiceChatStatus;
}

export function Animation({ status }: AnimationProps) {
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

  return (
    <div className="animation-container">
      <div className={`animation-circle ${getAnimationClass()}`}>
        <div className="animation-inner-circle" />
      </div>
      <div className="animation-status-text">{getStatusText()}</div>
    </div>
  );
}

