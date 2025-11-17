import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { VoiceChatStatus } from '../../types/voice-chat';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { Animation } from './Animation';
import { VolumeVisualizer } from './VolumeVisualizer';
import './VoiceCallPage.css';
import { createMachine } from 'holly-fsm';

const HANG_UP_SVG = '/assets/hang-up.svg';

// 状态自动转换延迟时间配置（毫秒）
const AUTO_TRANSITION_DELAYS = {
  WELCOME_TO_LISTENING: 3000,  // 欢迎状态自动进入监听的延迟时间
  SPEAKING_TO_LISTENING: 3000, // 说话状态自动进入监听的延迟时间
};

// 定义状态机配置
const createVoiceChatMachine = (context: {
  startListening: () => void;
  clearResponse: () => void;
  reconnect: () => void;
}) => {
  return createMachine({
    // 拨号中状态 - 播放电话语音
    calling: {
      connectionReady: () => {
        console.log('[状态机] 连接已建立，播放欢迎语音');
      },
      connectionLost: () => {
        console.log('[状态机] 连接失败');
      },
      stopCall: () => {
        console.log('stop calling')
      }
    },
    // 欢迎状态 - 播放欢迎语音
    welcome: {
      finishWelcome: () => {
        console.log('[状态机] 欢迎语音播放完成，开始监听');
        context.startListening();
      },
      interrupt: () => {
        console.log('[状态机] 欢迎语音被打断，进入监听');
        context.clearResponse();
        context.startListening();
      },
      connectionLost: () => {
        console.log('[状态机] 连接失败');
      },
    },
    // 思考状态 - 用户说完话，等待服务端响应
    thinking: {
      receiveResponse: () => {
        console.log('[状态机] 收到服务端响应，开始播放语音');
        return 'speaking';
      },
      interrupt: () => {
        console.log('[状态机] 思考被打断，进入监听');
        context.clearResponse();
        context.startListening();
        return 'listening';
      },
      connectionLost: () => {
        console.log('[状态机] 连接失败');
      },
    },
    // 说话状态 - 播放AI流式语音
    speaking: {
      finishSpeaking: () => {
        console.log('[状态机] 语音播放完成，继续监听');
        context.startListening();
        return 'listening';
      },
      interrupt: () => {
        console.log('[状态机] 语音被打断，进入监听');
        context.clearResponse();
        context.startListening();
        return 'listening';
      },
      connectionLost: () => {
        console.log('[状态机] 连接失败');
      },
    },
    // 监听状态 - 等待用户说话
    listening: {
      userSpeaking: () => {
        console.log('[状态机] 检测到用户说话，进入思考状态');
        return 'thinking';
      },
      connectionLost: () => {
        console.log('[状态机] 连接失败');
      },
    },
    // 网络错误状态
    network_error: {
      retry: () => {
        console.log('[状态机] 尝试重新连接');
        context.reconnect();
      },
    },
    // 重连中状态
    reconnecting: {
      connectionReady: () => {
        console.log('[状态机] 重连成功');
      },
      connectionLost: () => {
        console.log('[状态机] 重连失败');
      },
    },
  }, {
    initialState: 'calling',
  });
};

export function VoiceCallPage() {
  const navigate = useNavigate();
  const [voiceChatStatus, setVoiceChatStatus] = useState<VoiceChatStatus>(VoiceChatStatus.CALLING);

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
    serverUrl: 'ws://localhost:3002',
    silenceThreshold: 1500,
    volumeThreshold: 1.5,
    chunkInterval: 500,
    enableWebSocket: true,
  });

  // 创建状态机引用
  const machineRef = useRef<ReturnType<typeof createVoiceChatMachine> | null>(null);
  const prevResponseRef = useRef<any>(null);

  // 初始化状态机
  if (!machineRef.current) {
    machineRef.current = createVoiceChatMachine({
      startListening,
      clearResponse,
      reconnect,
    });
  }

  const machine = machineRef.current;

  // 监听状态机的状态变化，更新UI状态
  useEffect(() => {
    const unsubscribe = machine.onEnter((event) => {
      console.log(`[状态机] 进入状态: ${event.current}, 来自: ${event.last}, 动作: ${event.action}`);
      // 将状态机状态映射到 VoiceChatStatus
      setVoiceChatStatus(event.current as VoiceChatStatus);
    });

    return () => {
      unsubscribe();
    };
  }, [machine]);

  // 监听连接状态变化
  useEffect(() => {
    const currentState = machine.getState();
    
    if (isConnected) {
      // 连接成功
      if (currentState === 'calling' || currentState === 'reconnecting') {
        machine.connectionReady();
      }
    } else if (error) {
      // 连接失败
      if (currentState !== 'network_error' && currentState !== 'reconnecting') {
        machine.connectionLost();
      }
    }
  }, [isConnected, error, machine]);

  // 监听录音状态变化
  useEffect(() => {
    const currentState = machine.getState();
    
    if (audioStatus === 'recording' && currentState === 'listening') {
      // 用户开始说话（可以添加防抖逻辑避免频繁触发）
      const timer = setTimeout(() => {
        if (machine.getState() === 'listening') {
          machine.userSpeaking();
        }
      }, 500); // 延迟500ms确认用户真的在说话
      
      return () => clearTimeout(timer);
    }
  }, [audioStatus, machine]);

  // 监听响应接收
  useEffect(() => {
    // 避免重复处理同一个响应
    if (response && response !== prevResponseRef.current) {
      prevResponseRef.current = response;
      
      const currentState = machine.getState();
      console.log(`[响应处理] 当前状态: ${currentState}, 收到响应:`, response);
      
      // 根据当前状态决定如何处理响应
      if (currentState === 'thinking') {
        // 思考状态收到服务端响应，转到说话状态播放流式语音
        machine.receiveResponse();
      } else if (currentState === 'welcome' || currentState === 'speaking') {
        // 欢迎状态或说话状态收到响应，保持当前状态继续播放
        console.log('[响应处理] 继续播放当前语音');
      }
    }
  }, [response, machine]);

  // 自动完成欢迎状态，延迟后进入监听
  // 在实际项目中，这应该由音频播放完成事件触发
  useEffect(() => {
    if (voiceChatStatus === VoiceChatStatus.WELCOME) {
      const delay = AUTO_TRANSITION_DELAYS.WELCOME_TO_LISTENING;
      console.log(`[状态机] 进入欢迎状态，将在 ${delay}ms 后自动进入监听状态`);
      
      const timer = setTimeout(() => {
        if (machine.getState() === 'welcome') {
          console.log('[状态机] 欢迎状态结束，自动进入监听状态');
          machine.finishWelcome();
        }
      }, delay);
      
      return () => {
        clearTimeout(timer);
        console.log('[状态机] 清理欢迎状态定时器');
      };
    }
  }, [voiceChatStatus, machine]);

  // 自动完成说话状态（模拟AI语音播放完成）
  // 在实际项目中，这应该由音频播放完成事件触发
  useEffect(() => {
    if (voiceChatStatus === VoiceChatStatus.SPEAKING) {
      const delay = AUTO_TRANSITION_DELAYS.SPEAKING_TO_LISTENING;
      console.log(`[状态机] 进入说话状态，将在 ${delay}ms 后自动进入监听状态`);
      
      const timer = setTimeout(() => {
        if (machine.getState() === 'speaking') {
          console.log('[状态机] AI语音播放完成，自动进入监听状态');
          machine.finishSpeaking();
        }
      }, delay);
      
      return () => {
        clearTimeout(timer);
        console.log('[状态机] 清理说话状态定时器');
      };
    }
  }, [voiceChatStatus, machine]);

  const hangUp = useCallback(() => {
    stopListening();
    navigate('/ai-chat');
  }, [navigate, stopListening]);

  // 打断当前对话，立即回到监听状态
  const interruptAndListen = useCallback(() => {
    const currentState = machine.getState();
    // 只能在欢迎、思考、说话状态时打断
    if (currentState === 'welcome' || currentState === 'thinking' || currentState === 'speaking') {
      machine.interrupt();
    }
  }, [machine]);

  // 重新连接
  const handleReconnect = useCallback(() => {
    const currentState = machine.getState();
    if (currentState === 'network_error') {
      machine.retry();
    }
  }, [machine]);

  const handleScreenClick = useCallback(() => {
    const currentState = machine.getState();
    
    // 在欢迎、思考、说话状态时可以打断
    if (currentState === 'welcome' || currentState === 'thinking' || currentState === 'speaking') {
      interruptAndListen();
    }
    // 错误状态时重连
    else if (currentState === 'network_error') {
      handleReconnect();
    }
  }, [machine, interruptAndListen, handleReconnect]);

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
      
      {voiceChatStatus === VoiceChatStatus.NETWORK_ERROR && (
        <div className="error-hint">
          连接失败，点击屏幕重试
        </div>
      )}
      
      {/* 状态调试信息（开发时使用） */}
      <div className="debug-info" style={{ 
        position: 'fixed', 
        bottom: '80px', 
        left: '10px', 
        background: 'rgba(0,0,0,0.7)', 
        color: 'white', 
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>状态机: {machine.getState()}</div>
        <div>UI状态: {voiceChatStatus}</div>
        <div>录音: {audioStatus}</div>
        <div>连接: {isConnected ? '是' : '否'}</div>
      </div>
      
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
