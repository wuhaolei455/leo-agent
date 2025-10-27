import Recorder from 'js-audio-recorder';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { RecorderStatus } from '../types/voice-chat';

interface AudioRecorderOptions {
  serverUrl?: string;
  silenceThreshold?: number;
  volumeThreshold?: number;
  chunkInterval?: number;
  enableWebSocket?: boolean;
}

interface AudioResponse {
  type: string;
  text: string;
  timestamp: string;
  duration?: number;
}

export const useAudioRecorder = (options: AudioRecorderOptions = {}) => {
    const {
        serverUrl = 'http://localhost:3002',
        silenceThreshold = 1500,
        volumeThreshold = 1.5,
        chunkInterval = 500,
        enableWebSocket = true,
    } = options;

    const recorderRef = useRef<Recorder | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const vadIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const sendIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isListeningRef = useRef<boolean>(false);
    const isRecordingRef = useRef<boolean>(false);
    const socketRef = useRef<Socket | null>(null);
    const lastVoiceTimeRef = useRef<number>(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef<number>(0);
    
    const [audioStatus, setAudioStatus] = useState<RecorderStatus>(RecorderStatus.IDLE);
    const [isConnected, setIsConnected] = useState(false);
    const [response, setResponse] = useState<AudioResponse | null>(null);
    const [currentVolume, setCurrentVolume] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    // 重连机制
    const attemptReconnect = useCallback(() => {
        if (reconnectAttemptsRef.current >= 5) {
            setError('连接失败，请检查网络后重试');
            return;
        }

        reconnectAttemptsRef.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
        
        console.log(`尝试重连 (${reconnectAttemptsRef.current}/5)，等待 ${delay}ms`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
            if (socketRef.current) {
                socketRef.current.connect();
            }
        }, delay);
    }, []);

    // 初始化 WebSocket 连接
    useEffect(() => {
        if (!enableWebSocket) return;

        socketRef.current = io(serverUrl, {
            reconnection: false, // 使用自定义重连逻辑
            timeout: 10000,
        });

        socketRef.current.on('connect', () => {
            console.log('WebSocket 连接成功');
            setIsConnected(true);
            setError(null);
            reconnectAttemptsRef.current = 0;
        });

        socketRef.current.on('disconnect', (reason) => {
            console.log('WebSocket 断开连接:', reason);
            setIsConnected(false);
            
            // 自动重连（除非是客户端主动断开）
            if (reason !== 'io client disconnect') {
                attemptReconnect();
            }
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('WebSocket 连接错误:', error);
            setError('连接失败');
            attemptReconnect();
        });

        socketRef.current.on('audio-response', (data: AudioResponse) => {
            console.log('收到服务器响应:', data);
            setResponse(data);
        });

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [serverUrl, enableWebSocket, attemptReconnect]);

    // 初始化录音器
    useEffect(() => {
        recorderRef.current = new Recorder({
            sampleBits: 16,
            sampleRate: 16000,
            numChannels: 1,
        });

        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
            if (sendIntervalRef.current) clearInterval(sendIntervalRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            // 安全关闭 AudioContext
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(error => {
                    console.error('关闭 AudioContext 失败:', error);
                });
                audioContextRef.current = null;
            }
            if (recorderRef.current) {
                recorderRef.current.destroy().catch(error => {
                    console.error('销毁录音器失败:', error);
                });
            }
        }
    }, []);

    // 发送音频数据到服务器
    const sendAudioData = useCallback(() => {
        if (!recorderRef.current || !enableWebSocket || !socketRef.current?.connected) return;

        try {
            const pcmData = recorderRef.current.getPCMBlob();
            if (pcmData && pcmData.size > 0) {
                pcmData.arrayBuffer().then((arrayBuffer: ArrayBuffer) => {
                    socketRef.current?.emit('audio-stream', arrayBuffer);
                    console.log(`发送音频数据: ${arrayBuffer.byteLength} bytes`);
                });
            }
        } catch (error) {
            console.error('发送音频数据失败:', error);
        }
    }, [enableWebSocket]);

    const stopRecording = useCallback(() => {
        if (!recorderRef.current || !isRecordingRef.current) return;
        
        isRecordingRef.current = false;
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }

        if (sendIntervalRef.current) {
            clearInterval(sendIntervalRef.current);
            sendIntervalRef.current = null;
        }

        // 发送最后一块音频数据
        if (enableWebSocket) {
            sendAudioData();
        }
        
        recorderRef.current.stop();
        const wavBlob = recorderRef.current.getWAVBlob();
        
        if (wavBlob) {
            console.log('录音完成:', {
                size: `${(wavBlob.size / 1024).toFixed(2)} KB`,
                duration: `${recorderRef.current.duration.toFixed(2)}s`,
                url: URL.createObjectURL(wavBlob)
            });
        }

        if (enableWebSocket && socketRef.current) {
            socketRef.current.emit('stop-recording');
        }
        
        setAudioStatus(isListeningRef.current ? RecorderStatus.IDLE : RecorderStatus.STOPPED);
    }, [enableWebSocket, sendAudioData]);

    const startRecording = useCallback(async () => {
        if (!recorderRef.current || isRecordingRef.current) return;
        
        try {
            isRecordingRef.current = true;
            await recorderRef.current.start();
            setAudioStatus(RecorderStatus.RECORDING);

            if (enableWebSocket && socketRef.current) {
                socketRef.current.emit('start-recording');
            }

            // 定期发送音频数据
            if (enableWebSocket) {
                sendIntervalRef.current = setInterval(() => {
                    sendAudioData();
                }, chunkInterval);
            }

            console.log('开始录音' + (enableWebSocket ? '和流式传输' : ''));
        } catch (error) {
            console.error('录音失败:', error);
            isRecordingRef.current = false;
        }
    }, [enableWebSocket, sendAudioData, chunkInterval]);

    const detectVoiceActivity = useCallback((): number => {
        if (!analyserRef.current) return 0;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sum += normalized * normalized;
        }
        const volume = Math.sqrt(sum / bufferLength) * 100;
        
        // 更新当前音量状态
        setCurrentVolume(volume);
        
        return volume;
    }, []);

    const startListening = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;
            source.connect(analyserRef.current);
            
            isListeningRef.current = true;
            setAudioStatus(RecorderStatus.IDLE);
            
            vadIntervalRef.current = setInterval(() => {
                const volume = detectVoiceActivity();
                const now = Date.now();

                if (volume > volumeThreshold) {
                    // 检测到声音
                    lastVoiceTimeRef.current = now;

                    // 如果还没开始录音，则开始录音
                    if (isListeningRef.current && !isRecordingRef.current) {
                        startRecording();
                    }
                } else {
                    // 静音
                    if (lastVoiceTimeRef.current > 0 && isRecordingRef.current) {
                        const silence = now - lastVoiceTimeRef.current;

                        // 如果静音时间超过阈值，停止录音
                        if (silence > silenceThreshold) {
                            stopRecording();
                            lastVoiceTimeRef.current = 0;
                        }
                    }
                }
            }, 100);
        } catch (error) {
            console.error('启动监听失败:', error);
            alert('无法访问麦克风，请确保已授予麦克风权限');
        }
    }, [detectVoiceActivity, startRecording, volumeThreshold, silenceThreshold, stopRecording]);

    const stopListening = useCallback(() => {
        isListeningRef.current = false;
        
        if (vadIntervalRef.current) {
            clearInterval(vadIntervalRef.current);
            vadIntervalRef.current = null;
        }
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        // 安全关闭 AudioContext，检查状态避免重复关闭
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(error => {
                console.error('关闭 AudioContext 失败:', error);
            });
            audioContextRef.current = null;
        }
        
        setAudioStatus(RecorderStatus.IDLE);
    }, []);

    const getRecordingData = useCallback(() => {
        return recorderRef.current?.getWAVBlob() || null;
    }, []);

    // 手动重连
    const reconnect = useCallback(() => {
        setError(null);
        reconnectAttemptsRef.current = 0;
        if (socketRef.current) {
            socketRef.current.connect();
        }
    }, []);

    // 清除响应
    const clearResponse = useCallback(() => {
        setResponse(null);
    }, []);

    return {
        audioStatus,
        isConnected,
        response,
        currentVolume,
        error,
        analyser: analyserRef.current,
        startListening,
        stopListening,
        getRecordingData,
        reconnect,
        clearResponse,
    }
}