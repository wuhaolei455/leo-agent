/**
 * useHeartbeat Hook
 * 优雅地管理 WebSocket 心跳机制
 * 使用 Web Worker 在独立线程中处理心跳，避免主线程阻塞
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  HeartbeatConfig,
  HeartbeatStatus,
  HeartbeatCallbacks,
  UseHeartbeatReturn,
} from '../types/heartbeat';

interface WorkerMessage {
  type: 'ping' | 'timeout' | 'missed' | 'status' | 'error';
  timestamp?: number;
  missedCount?: number;
  message?: string;
  isActive?: boolean;
}

const DEFAULT_CONFIG: Required<HeartbeatConfig> = {
  interval: 5000,
  timeout: 3000,
  maxMissed: 3,
  autoStart: false,
};

export const useHeartbeat = (
  config: HeartbeatConfig = {},
  callbacks: HeartbeatCallbacks = {}
): UseHeartbeatReturn => {
  const workerRef = useRef<Worker | null>(null);
  const configRef = useRef<Required<HeartbeatConfig>>({
    ...DEFAULT_CONFIG,
    ...config,
  });
  const callbacksRef = useRef(callbacks);

  // 更新 callbacks ref（避免闭包陷阱）
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const [status, setStatus] = useState<HeartbeatStatus>({
    isActive: false,
    missedCount: 0,
    lastHeartbeat: null,
    lastPong: null,
  });

  // 初始化 Worker
  useEffect(() => {
    try {
      // 创建 Worker
      const worker = new Worker(
        new URL('../workers/heartbeat.worker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current = worker;

      // 处理 Worker 消息
      worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const { type, timestamp, missedCount, message, isActive } = event.data;

        switch (type) {
          case 'ping':
            setStatus((prev) => ({
              ...prev,
              lastHeartbeat: timestamp || Date.now(),
            }));
            callbacksRef.current.onPing?.(timestamp || Date.now());
            break;

          case 'missed':
            setStatus((prev) => ({
              ...prev,
              missedCount: missedCount || 0,
            }));
            callbacksRef.current.onMissed?.(missedCount || 0);
            break;

          case 'timeout':
            setStatus((prev) => ({
              ...prev,
              missedCount: missedCount || 0,
            }));
            callbacksRef.current.onTimeout?.(missedCount || 0);
            break;

          case 'status':
            setStatus((prev) => ({
              ...prev,
              isActive: isActive || false,
              missedCount: isActive ? prev.missedCount : 0,
            }));
            if (typeof isActive === 'boolean') {
              callbacksRef.current.onStatusChange?.(isActive);
            }
            console.log('[Heartbeat]', message);
            break;

          case 'error':
            console.error('[Heartbeat Error]', message);
            callbacksRef.current.onError?.(message || '未知错误');
            break;
        }
      };

      worker.onerror = (error) => {
        console.error('[Heartbeat Worker Error]', error);
        callbacksRef.current.onError?.(error.message || 'Worker 错误');
      };

      // 发送初始配置
      worker.postMessage({
        type: 'config',
        config: configRef.current,
      });

      // 如果配置了自动启动，则启动心跳
      if (configRef.current.autoStart) {
        worker.postMessage({ type: 'start' });
      }

      return () => {
        worker.postMessage({ type: 'stop' });
        worker.terminate();
      };
    } catch (error) {
      console.error('[Heartbeat] Worker 初始化失败:', error);
      callbacksRef.current.onError?.(
        error instanceof Error ? error.message : 'Worker 初始化失败'
      );
      return undefined;
    }
  }, []); // 只在组件挂载时初始化一次

  // 启动心跳
  const start = useCallback(() => {
    workerRef.current?.postMessage({ type: 'start' });
  }, []);

  // 停止心跳
  const stop = useCallback(() => {
    workerRef.current?.postMessage({ type: 'stop' });
  }, []);

  // 暂停心跳
  const pause = useCallback(() => {
    workerRef.current?.postMessage({ type: 'pause' });
  }, []);

  // 恢复心跳
  const resume = useCallback(() => {
    workerRef.current?.postMessage({ type: 'resume' });
  }, []);

  // 通知收到 pong
  const notifyPong = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      lastPong: Date.now(),
      missedCount: 0,
    }));
    workerRef.current?.postMessage({ type: 'pong' });
    callbacksRef.current.onPong?.(Date.now());
  }, []);

  // 更新配置
  const updateConfig = useCallback((newConfig: Partial<HeartbeatConfig>) => {
    configRef.current = {
      ...configRef.current,
      ...newConfig,
    };
    workerRef.current?.postMessage({
      type: 'config',
      config: configRef.current,
    });
  }, []);

  return {
    status,
    start,
    stop,
    pause,
    resume,
    notifyPong,
    updateConfig,
  };
};

