/**
 * 心跳相关类型定义
 */

export interface HeartbeatConfig {
  /** 心跳间隔（毫秒） */
  interval?: number;
  /** 心跳超时时间（毫秒） */
  timeout?: number;
  /** 最大允许的未响应心跳次数 */
  maxMissed?: number;
  /** 是否自动启动 */
  autoStart?: boolean;
}

export interface HeartbeatStatus {
  /** 是否激活 */
  isActive: boolean;
  /** 连续未响应次数 */
  missedCount: number;
  /** 最后一次心跳时间 */
  lastHeartbeat: number | null;
  /** 最后一次响应时间 */
  lastPong: number | null;
}

export interface HeartbeatCallbacks {
  /** 发送心跳时的回调 */
  onPing?: (timestamp: number) => void;
  /** 收到响应时的回调 */
  onPong?: (timestamp: number) => void;
  /** 错过心跳时的回调 */
  onMissed?: (missedCount: number) => void;
  /** 心跳超时时的回调（连续多次未响应） */
  onTimeout?: (missedCount: number) => void;
  /** 状态变化时的回调 */
  onStatusChange?: (isActive: boolean) => void;
  /** 错误时的回调 */
  onError?: (message: string) => void;
}

export interface UseHeartbeatReturn {
  /** 心跳状态 */
  status: HeartbeatStatus;
  /** 启动心跳 */
  start: () => void;
  /** 停止心跳 */
  stop: () => void;
  /** 暂停心跳 */
  pause: () => void;
  /** 恢复心跳 */
  resume: () => void;
  /** 通知收到 pong */
  notifyPong: () => void;
  /** 更新配置 */
  updateConfig: (config: Partial<HeartbeatConfig>) => void;
}

