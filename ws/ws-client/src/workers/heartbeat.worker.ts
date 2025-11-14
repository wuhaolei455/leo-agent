/**
 * 心跳 Worker
 * 负责在独立线程中管理心跳定时器，避免主线程阻塞影响心跳准确性
 */

interface HeartbeatConfig {
  interval: number; // 心跳间隔（毫秒）
  timeout: number; // 心跳超时时间（毫秒）
  maxMissed: number; // 最大允许的未响应心跳次数
}

interface WorkerMessage {
  type: 'start' | 'stop' | 'pause' | 'resume' | 'pong' | 'config';
  config?: HeartbeatConfig;
}

interface WorkerResponse {
  type: 'ping' | 'timeout' | 'missed' | 'status' | 'error';
  timestamp?: number;
  missedCount?: number;
  message?: string;
  isActive?: boolean;
}

// 心跳状态
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
let missedHeartbeats = 0;
let isActive = false;
let isPaused = false;

// 默认配置
let config: HeartbeatConfig = {
  interval: 5000, // 5秒
  timeout: 3000, // 3秒
  maxMissed: 3, // 最多错过3次
};

// 发送消息到主线程
const postMessage = (message: WorkerResponse) => {
  self.postMessage(message);
};

// 清除所有定时器
const clearAllTimers = () => {
  if (heartbeatTimer !== null) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (timeoutTimer !== null) {
    clearTimeout(timeoutTimer);
    timeoutTimer = null;
  }
};

// 处理心跳超时
const handleTimeout = () => {
  missedHeartbeats++;
  
  postMessage({
    type: 'missed',
    missedCount: missedHeartbeats,
    timestamp: Date.now(),
  });

  if (missedHeartbeats >= config.maxMissed) {
    postMessage({
      type: 'timeout',
      missedCount: missedHeartbeats,
      timestamp: Date.now(),
      message: `心跳超时：连续 ${missedHeartbeats} 次未收到响应`,
    });
    
    // 可选：停止心跳，等待主线程决定如何处理
    // stop();
  }
};

// 发送心跳
const sendHeartbeat = () => {
  if (isPaused) {
    return;
  }

  const now = Date.now();
  
  postMessage({
    type: 'ping',
    timestamp: now,
  });

  // 设置超时定时器
  if (timeoutTimer !== null) {
    clearTimeout(timeoutTimer);
  }
  
  timeoutTimer = setTimeout(handleTimeout, config.timeout);
};

// 启动心跳
const start = () => {
  if (isActive) {
    stop(); // 先停止现有的心跳
  }

  isActive = true;
  isPaused = false;
  missedHeartbeats = 0;
  
  // 立即发送一次心跳
  sendHeartbeat();
  
  // 设置定时心跳
  heartbeatTimer = setInterval(sendHeartbeat, config.interval);
  
  postMessage({
    type: 'status',
    isActive: true,
    timestamp: Date.now(),
    message: '心跳已启动',
  });
};

// 停止心跳
const stop = () => {
  clearAllTimers();
  isActive = false;
  isPaused = false;
  missedHeartbeats = 0;
  
  postMessage({
    type: 'status',
    isActive: false,
    timestamp: Date.now(),
    message: '心跳已停止',
  });
};

// 暂停心跳
const pause = () => {
  isPaused = true;
  clearAllTimers();
  
  postMessage({
    type: 'status',
    isActive: false,
    timestamp: Date.now(),
    message: '心跳已暂停',
  });
};

// 恢复心跳
const resume = () => {
  if (!isActive) {
    start();
    return;
  }
  
  isPaused = false;
  sendHeartbeat();
  heartbeatTimer = setInterval(sendHeartbeat, config.interval);
  
  postMessage({
    type: 'status',
    isActive: true,
    timestamp: Date.now(),
    message: '心跳已恢复',
  });
};

// 处理 pong 响应
const handlePong = () => {
  // 清除超时定时器
  if (timeoutTimer !== null) {
    clearTimeout(timeoutTimer);
    timeoutTimer = null;
  }
  
  // 重置错过次数
  if (missedHeartbeats > 0) {
    missedHeartbeats = 0;
    postMessage({
      type: 'status',
      isActive: true,
      timestamp: Date.now(),
      message: '心跳已恢复正常',
    });
  }
};

// 更新配置
const updateConfig = (newConfig: Partial<HeartbeatConfig>) => {
  config = { ...config, ...newConfig };
  
  // 如果心跳正在运行，重启以应用新配置
  if (isActive && !isPaused) {
    start();
  }
  
  postMessage({
    type: 'status',
    isActive,
    timestamp: Date.now(),
    message: '配置已更新',
  });
};

// 监听主线程消息
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, config: newConfig } = event.data;

  try {
    switch (type) {
      case 'start':
        start();
        break;
      case 'stop':
        stop();
        break;
      case 'pause':
        pause();
        break;
      case 'resume':
        resume();
        break;
      case 'pong':
        handlePong();
        break;
      case 'config':
        if (newConfig) {
          updateConfig(newConfig);
        }
        break;
      default:
        postMessage({
          type: 'error',
          message: `未知的消息类型: ${type}`,
        });
    }
  } catch (error) {
    postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

// Worker 初始化完成
postMessage({
  type: 'status',
  isActive: false,
  timestamp: Date.now(),
  message: 'Worker 已初始化',
});

// TypeScript 需要导出以使其成为模块
export {};

