import { useCallback, useEffect, useRef, useState } from 'react';
import { ManagerOptions, Socket, SocketOptions, io } from 'socket.io-client';
import { useHeartbeat } from './useHeartbeat';
import type { HeartbeatConfig } from '../types/heartbeat';

type Listener = {
    event: string;
    handler: (...args: any[]) => void;
};

interface UseWebSocketOptions {
    serverUrl?: string;
    enable?: boolean;
    maxReconnectAttempts?: number;
    connectionOptions?: Partial<ManagerOptions & SocketOptions>;
    /** 心跳配置，传入 false 禁用心跳 */
    heartbeat?: HeartbeatConfig | false;
    /** 心跳事件名称 */
    heartbeatEvent?: {
        ping: string;
        pong: string;
    };
    onConnect?: (socket: Socket) => void;
    onDisconnect?: (reason: Socket.DisconnectReason, socket: Socket) => void;
    onError?: (message: string, error?: Error) => void;
}

export const useWebSocket = ({
    serverUrl = 'http://localhost:9000',
    enable = true,
    maxReconnectAttempts = 5,
    connectionOptions,
    heartbeat = { interval: 5000, timeout: 3000, maxMissed: 3, autoStart: true },
    heartbeatEvent = { ping: 'ping', pong: 'pong' },
    onConnect,
    onDisconnect,
    onError,
}: UseWebSocketOptions = {}) => {
    const socketRef = useRef<Socket | null>(null);
    const listenersRef = useRef<Listener[]>([]);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 心跳机制
    const heartbeatHook = useHeartbeat(
        heartbeat !== false ? heartbeat : { autoStart: false },
        {
            onPing: (timestamp) => {
                // 发送心跳到服务器
                if (socketRef.current?.connected) {
                    socketRef.current.emit(heartbeatEvent.ping, { timestamp });
                }
            },
            onTimeout: (missedCount) => {
                console.error(`心跳超时，连续 ${missedCount} 次未收到响应`);
                // 心跳超时，可能需要重连
                if (socketRef.current?.connected) {
                    socketRef.current.disconnect();
                }
            },
            onError: (message) => {
                console.error('心跳错误:', message);
                onError?.(message);
            },
        }
    );

    const clearReconnectTimer = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    const registerStoredListeners = useCallback((socket: Socket) => {
        listenersRef.current.forEach(({ event, handler }) => {
            socket.on(event, handler);
        });
    }, []);

    const attemptReconnect = useCallback(() => {
        if (!enable || !socketRef.current) {
            return;
        }

        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            const message = '连接失败，请检查网络后重试';
            setError(message);
            onError?.(message);
            return;
        }

        reconnectAttemptsRef.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);

        console.log(`尝试重连 (${reconnectAttemptsRef.current}/${maxReconnectAttempts})，等待 ${delay}ms`);

        clearReconnectTimer();
        reconnectTimeoutRef.current = setTimeout(() => {
            socketRef.current?.connect();
        }, delay);
    }, [enable, maxReconnectAttempts, onError, clearReconnectTimer]);

    useEffect(() => {
        if (!enable) {
            setIsConnected(false);
            setError(null);
            clearReconnectTimer();

            if (socketRef.current) {
                listenersRef.current.forEach(({ event, handler }) => {
                    socketRef.current?.off(event, handler);
                });
                socketRef.current.disconnect();
                socketRef.current = null;
            }

            return;
        }

        const socket = io(serverUrl, {
            reconnection: false,
            timeout: 10000,
            ...connectionOptions,
        });

        socketRef.current = socket;
        registerStoredListeners(socket);

        const handleConnect = () => {
            setIsConnected(true);
            setError(null);
            reconnectAttemptsRef.current = 0;
            clearReconnectTimer();
            
            // 启动心跳
            if (heartbeat !== false) {
                heartbeatHook.start();
            }
            
            onConnect?.(socket);
        };

        const handleDisconnect = (reason: Socket.DisconnectReason) => {
            setIsConnected(false);
            
            // 停止心跳
            if (heartbeat !== false) {
                heartbeatHook.stop();
            }
            
            onDisconnect?.(reason, socket);

            if (reason !== 'io client disconnect') {
                attemptReconnect();
            }
        };

        const handleConnectError = (socketError: Error) => {
            const message = '连接失败';
            setError(message);
            onError?.(message, socketError);
            attemptReconnect();
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);

        // 监听 pong 响应
        if (heartbeat !== false) {
            socket.on(heartbeatEvent.pong, () => {
                heartbeatHook.notifyPong();
            });
        }

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);
            
            if (heartbeat !== false) {
                socket.off(heartbeatEvent.pong);
            }

            listenersRef.current.forEach(({ event, handler }) => {
                socket.off(event, handler);
            });

            clearReconnectTimer();
            socket.disconnect();
        };
    }, [serverUrl, enable, connectionOptions, registerStoredListeners, attemptReconnect, clearReconnectTimer, onConnect, onDisconnect, onError, heartbeat, heartbeatEvent, heartbeatHook]);

    const on = useCallback(
        (event: string, handler: (...args: any[]) => void) => {
            const listener: Listener = { event, handler };
            listenersRef.current.push(listener);

            if (socketRef.current) {
                socketRef.current.on(event, handler);
            }

            return () => {
                listenersRef.current = listenersRef.current.filter((item) => item !== listener);
                socketRef.current?.off(event, handler);
            };
        },
        []
    );

    const emit = useCallback((event: string, payload?: unknown) => {
        if (!socketRef.current?.connected) {
            return false;
        }

        socketRef.current.emit(event, payload);
        return true;
    }, []);

    const reconnect = useCallback(() => {
        setError(null);
        reconnectAttemptsRef.current = 0;
        clearReconnectTimer();
        socketRef.current?.connect();
    }, [clearReconnectTimer]);

    const disconnect = useCallback(() => {
        clearReconnectTimer();
        socketRef.current?.disconnect();
    }, [clearReconnectTimer]);

    return {
        socket: socketRef.current,
        isConnected,
        error,
        emit,
        on,
        reconnect,
        disconnect,
        heartbeat: heartbeat !== false ? heartbeatHook : null,
    };
};

