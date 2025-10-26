import Recorder from 'js-audio-recorder';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RecorderStatus } from '../types/voice-chat';

export const useAudioRecorder = () => {
    const recorderRef = useRef<Recorder | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const vadIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isListeningRef = useRef<boolean>(false);
    const isRecordingRef = useRef<boolean>(false);
    
    const [audioStatus, setAudioStatus] = useState<RecorderStatus>(RecorderStatus.IDLE);

    useEffect(() => {
        recorderRef.current = new Recorder({
            sampleBits: 16,
            sampleRate: 16000,
            numChannels: 1,
        });

        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
            if (audioContextRef.current) audioContextRef.current.close();
            if (recorderRef.current) {
                recorderRef.current.destroy().catch(error => {
                    console.error('销毁录音器失败:', error);
                });
            }
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (!recorderRef.current || !isRecordingRef.current) return;
        
        isRecordingRef.current = false;
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
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
        
        setAudioStatus(isListeningRef.current ? RecorderStatus.IDLE : RecorderStatus.STOPPED);
    }, []);

    const startRecording = useCallback(async () => {
        if (!recorderRef.current) return;
        
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
        
        silenceTimerRef.current = setTimeout(() => stopRecording(), 3000);
        
        if (isRecordingRef.current) return;
        
        try {
            isRecordingRef.current = true;
            await recorderRef.current.start();
            setAudioStatus(RecorderStatus.RECORDING);
        } catch (error) {
            console.error('录音失败:', error);
            isRecordingRef.current = false;
        }
    }, [stopRecording]);

    const detectVoiceActivity = useCallback((): boolean => {
        if (!analyserRef.current) return false;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sum += normalized * normalized;
        }
        const volume = Math.sqrt(sum / bufferLength) * 100;
        
        return volume > 1.5;
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
                if (isListeningRef.current && !isRecordingRef.current && detectVoiceActivity()) {
                    startRecording();
                }
            }, 100);
        } catch (error) {
            console.error('启动监听失败:', error);
            alert('无法访问麦克风，请确保已授予麦克风权限');
        }
    }, [detectVoiceActivity, startRecording]);

    const stopListening = useCallback(() => {
        isListeningRef.current = false;
        
        if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        
        setAudioStatus(RecorderStatus.IDLE);
    }, []);

    const getRecordingData = useCallback(() => {
        return recorderRef.current?.getWAVBlob() || null;
    }, []);

    return {
        audioStatus,
        startListening,
        stopListening,
        getRecordingData,
    }
}