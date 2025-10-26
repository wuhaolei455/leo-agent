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
  
  const { startListening, stopListening } = useAudioRecorder();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVoiceChatStatus(VoiceChatStatus.WELCOME);
      setTimeout(() => {
        setVoiceChatStatus(VoiceChatStatus.LISTENING);
        startListening();
      }, 2000);
    }, 1500);
    return () => clearTimeout(timer);
  }, [startListening]);

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
      <div className="title">AI助手</div>
      
      <Animation status={voiceChatStatus} />
      
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

