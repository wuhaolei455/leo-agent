import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import './App.css';

interface Message {
  id: string;
  text: string;
  type: 'sent' | 'received' | 'broadcast' | 'system';
  timestamp: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);

  // 使用 useCallback 稳定回调函数，避免每次渲染都创建新函数
  const handleConnect = useCallback(() => {
    console.log('WebSocket 已连接');
  }, []);

  const handleDisconnect = useCallback((reason: any) => {
    console.log('WebSocket 已断开:', reason);
  }, []);

  const handleError = useCallback((message: string, err?: Error) => {
    console.error('WebSocket 错误:', message, err);
  }, []);

  const {
    isConnected,
    error,
    emit,
    on,
    reconnect,
  } = useWebSocket({
    serverUrl: 'http://localhost:9000',
    enable: true,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError,
  });

  useEffect(() => {
    // 监听欢迎消息
    const unsubscribeWelcome = on('welcome', (data) => {
      console.log('欢迎消息:', data);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: data.message,
          type: 'system',
          timestamp: data.timestamp,
        },
      ]);
    });

    // 监听在线人数
    const unsubscribeOnlineCount = on('online-count', (data) => {
      console.log('在线人数:', data.count);
      setOnlineCount(data.count);
    });

    // 监听消息回应
    const unsubscribeMessageResponse = on('message-response', (data) => {
      console.log('消息回应:', data);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: data.response,
          type: 'received',
          timestamp: data.timestamp,
        },
      ]);
    });

    // 监听广播消息
    const unsubscribeBroadcast = on('broadcast', (data) => {
      console.log('广播消息:', data);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `[广播] ${data.message}`,
          type: 'broadcast',
          timestamp: data.timestamp,
        },
      ]);
    });

    // 监听 pong 响应
    const unsubscribePong = on('pong', (data) => {
      console.log('收到 pong 响应:', data);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: '🏓 Pong! 服务器响应成功',
          type: 'system',
          timestamp: data.timestamp,
        },
      ]);
    });

    return () => {
      unsubscribeWelcome();
      unsubscribeOnlineCount();
      unsubscribeMessageResponse();
      unsubscribeBroadcast();
      unsubscribePong();
    };
  }, [on]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const success = emit('message', inputValue);
    
    if (success) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: inputValue,
          type: 'sent',
          timestamp: new Date().toISOString(),
        },
      ]);
      setInputValue('');
    }
  };

  const handleBroadcast = () => {
    if (!inputValue.trim()) return;

    const success = emit('broadcast', inputValue);
    
    if (success) {
      setInputValue('');
    }
  };

  const handlePing = () => {
    const success = emit('ping');
    
    if (success) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: '🏓 Ping... 等待服务器响应',
          type: 'sent',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>WebSocket Demo</h1>
          <div className="status-bar">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '已连接' : '未连接'}
            </div>
            <div className="online-count">在线: {onlineCount}</div>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={reconnect} className="btn-reconnect">
              重新连接
            </button>
          </div>
        )}

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-messages">
              <p>暂无消息</p>
              <p>发送一条消息开始聊天吧！</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`message message-${msg.type}`}>
                <div className="message-content">
                  <span className="message-text">{msg.text}</span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="input-container">
          <input
            type="text"
            className="message-input"
            placeholder="输入消息..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            disabled={!isConnected}
          />
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={handleSendMessage}
              disabled={!isConnected || !inputValue.trim()}
            >
              发送消息
            </button>
            <button
              className="btn btn-broadcast"
              onClick={handleBroadcast}
              disabled={!isConnected || !inputValue.trim()}
            >
              广播
            </button>
            <button
              className="btn btn-secondary"
              onClick={handlePing}
              disabled={!isConnected}
            >
              Ping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

