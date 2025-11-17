import { useCallback, useEffect, useRef, useState } from 'react';
import { WebSocketClient, WebSocketEventType, WebSocketMessageData } from 'holly-websocket';

type Listener = {
    event: string;
    handler: (...args: any[]) => void;
};

interface UseWebSocketOptions {
    serverUrl?: string;
    enable?: boolean;
    maxReconnectAttempts?: number;
    onConnect?: () => void;
    onDisconnect?: (reason: string) => void;
    onError?: (message: string, error?: Error) => void;
}

export const useWebSocket = ({
    serverUrl = 'ws://localhost:3002',
    enable = true,
    maxReconnectAttempts = 5,
    onConnect,
    onDisconnect,
    onError,
}: UseWebSocketOptions = {}) => {
    const clientRef = useRef<WebSocketClient | null>(null);
    const listenersRef = useRef<Listener[]>([]);

    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const registerStoredListeners = useCallback((client: WebSocketClient) => {
        listenersRef.current.forEach(({ event, handler }) => {
            client.on(WebSocketEventType.MESSAGE, (data: WebSocketMessageData) => {
                try {
                    // 尝试解析 JSON 消息
                    const message = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
                    if (message.event === event) {
                        handler(message.data);
                    }
                } catch (e) {
                    // 如果不是 JSON 格式，直接传递原始数据
                    handler(data.data);
                }
            });
        });
    }, []);

    useEffect(() => {
        if (!enable) {
            setIsConnected(false);
            setError(null);

            if (clientRef.current) {
                clientRef.current.destroy();
                clientRef.current = null;
            }

            return;
        }

        const client = new WebSocketClient({
            url: serverUrl,
            reconnect: true,
            reconnectAttempts: maxReconnectAttempts,
            reconnectInterval: 3000,
            heartbeat: true,
            heartbeatInterval: 30000,
            heartbeatMessage: 'ping',
            debug: true,
        });

        clientRef.current = client;
        registerStoredListeners(client);

        const handleOpen = () => {
            console.log('[WebSocket] 连接已建立');
            setIsConnected(true);
            setError(null);
            onConnect?.();
        };

        const handleClose = (data: any) => {
            console.log('[WebSocket] 连接已关闭', data);
            setIsConnected(false);
            onDisconnect?.(data.reason || 'unknown');
        };

        const handleError = (errorData: any) => {
            console.error('[WebSocket] 连接错误', errorData);
            const message = '连接失败';
            setError(message);
            onError?.(message, errorData.error);
        };

        const handleReconnecting = (data: any) => {
            console.log(`[WebSocket] 正在重连 (${data.attempt}/${data.maxAttempts})`);
            setError(`正在重连 (${data.attempt}/${data.maxAttempts})`);
        };

        const handleReconnected = () => {
            console.log('[WebSocket] 重连成功');
            setIsConnected(true);
            setError(null);
            onConnect?.();
        };

        const handleReconnectFailed = (data: any) => {
            console.error('[WebSocket] 重连失败', data);
            const message = '连接失败，请检查网络后重试';
            setError(message);
            onError?.(message);
        };

        client.on(WebSocketEventType.OPEN, handleOpen);
        client.on(WebSocketEventType.CLOSE, handleClose);
        client.on(WebSocketEventType.ERROR, handleError);
        client.on(WebSocketEventType.RECONNECTING, handleReconnecting);
        client.on(WebSocketEventType.RECONNECTED, handleReconnected);
        client.on(WebSocketEventType.RECONNECT_FAILED, handleReconnectFailed);

        client.connect();

        return () => {
            client.offAll();
            client.destroy();
        };
    }, [serverUrl, enable, maxReconnectAttempts, registerStoredListeners, onConnect, onDisconnect, onError]);

    const on = useCallback(
        (event: string, handler: (...args: any[]) => void) => {
            const listener: Listener = { event, handler };
            listenersRef.current.push(listener);

            if (clientRef.current && clientRef.current.isConnected()) {
                clientRef.current.on(WebSocketEventType.MESSAGE, (data: WebSocketMessageData) => {
                    try {
                        const message = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
                        if (message.event === event) {
                            handler(message.data);
                        }
                    } catch (e) {
                        handler(data.data);
                    }
                });
            }

            return () => {
                listenersRef.current = listenersRef.current.filter((item) => item !== listener);
            };
        },
        []
    );

    const emit = useCallback((event: string, payload?: unknown) => {
        if (!clientRef.current?.isConnected()) {
            console.warn('[WebSocket] 尝试发送消息但未连接');
            return false;
        }

        const message = {
            event,
            data: payload,
        };

        clientRef.current.sendJSON(message);
        return true;
    }, []);

    const reconnect = useCallback(() => {
        setError(null);
        if (clientRef.current) {
            clientRef.current.connect();
        }
    }, []);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.disconnect();
        }
    }, []);

    return {
        client: clientRef.current,
        isConnected,
        error,
        emit,
        on,
        reconnect,
        disconnect,
    };
};
