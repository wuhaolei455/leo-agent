import { useCallback, useEffect, useRef, useState } from 'react';
import { ManagerOptions, Socket, SocketOptions, io } from 'socket.io-client';

type Listener = {
    event: string;
    handler: (...args: any[]) => void;
};

interface UseWebSocketOptions {
    serverUrl?: string;
    enable?: boolean;
    maxReconnectAttempts?: number;
    connectionOptions?: Partial<ManagerOptions & SocketOptions>;
    onConnect?: (socket: Socket) => void;
    onDisconnect?: (reason: Socket.DisconnectReason, socket: Socket) => void;
    onError?: (message: string, error?: Error) => void;
}

export const useWebSocket = ({
    serverUrl = 'http://localhost:9000',
    enable = true,
    maxReconnectAttempts = 5,
    connectionOptions,
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
            onConnect?.(socket);
        };

        const handleDisconnect = (reason: Socket.DisconnectReason) => {
            setIsConnected(false);
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

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);

            listenersRef.current.forEach(({ event, handler }) => {
                socket.off(event, handler);
            });

            clearReconnectTimer();
            socket.disconnect();
        };
    }, [serverUrl, enable, connectionOptions, registerStoredListeners, attemptReconnect, clearReconnectTimer, onConnect, onDisconnect, onError]);

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
    };
};

