import { useState, useRef, useCallback, useEffect } from 'react';
import Recorder from 'js-audio-recorder';
import { AudioRecorderState, RecorderStatus } from './types';

export const useAudioRecorder = () => {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioUrl: null,
  });
  const [status, setStatus] = useState<RecorderStatus>(RecorderStatus.IDLE);
  const recorderRef = useRef<Recorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化录音器
  useEffect(() => {
    recorderRef.current = new Recorder({
      sampleBits: 16,        // 采样位数，支持 8 或 16，默认是16
      sampleRate: 16000,     // 采样率，支持 11025、16000、22050、24000、44100、48000，默认是16000
      numChannels: 1,        // 声道，支持 1 或 2， 默认是1
    });

    return () => {
      if (recorderRef.current) {
        recorderRef.current.destroy();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 开始录音
  const startRecording = useCallback(async () => {
    if (!recorderRef.current) return;

    try {
      await recorderRef.current.start();
      setState(prev => ({ ...prev, isRecording: true, isPaused: false, audioUrl: null }));
      setStatus(RecorderStatus.RECORDING);

      // 开始计时
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      console.log('录音开始');
    } catch (error) {
      console.error('录音失败:', error);
      alert('无法访问麦克风，请确保已授予麦克风权限');
    }
  }, []);

  // 暂停录音
  const pauseRecording = useCallback(() => {
    if (!recorderRef.current) return;

    recorderRef.current.pause();
    setState(prev => ({ ...prev, isPaused: true }));
    setStatus(RecorderStatus.PAUSED);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    console.log('录音暂停');
  }, []);

  // 恢复录音
  const resumeRecording = useCallback(() => {
    if (!recorderRef.current) return;

    recorderRef.current.resume();
    setState(prev => ({ ...prev, isPaused: false }));
    setStatus(RecorderStatus.RECORDING);

    // 继续计时
    timerRef.current = setInterval(() => {
      setState(prev => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);

    console.log('录音恢复');
  }, []);

  // 停止录音
  const stopRecording = useCallback(() => {
    if (!recorderRef.current) return;

    recorderRef.current.stop();
    setState(prev => ({ ...prev, isRecording: false, isPaused: false }));
    setStatus(RecorderStatus.STOPPED);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 获取录音的 WAV Blob 数据
    const wavBlob = recorderRef.current.getWAVBlob();
    const audioUrl = URL.createObjectURL(wavBlob);
    setState(prev => ({ ...prev, audioUrl }));

    console.log('录音停止');
  }, []);

  // 播放录音
  const playRecording = useCallback(() => {
    if (!recorderRef.current) return;

    recorderRef.current.play();
    console.log('播放录音');
  }, []);

  // 停止播放
  const stopPlayback = useCallback(() => {
    if (!recorderRef.current) return;

    recorderRef.current.pausePlay();
    console.log('停止播放');
  }, []);

  // 下载录音
  const downloadRecording = useCallback((filename: string = 'recording.wav') => {
    if (!recorderRef.current) return;

    recorderRef.current.downloadWAV(filename);
    console.log('下载录音:', filename);
  }, []);

  // 重置
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioUrl: null,
    });
    setStatus(RecorderStatus.IDLE);

    // 清理旧的音频 URL
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    console.log('重置录音器');
  }, [state.audioUrl]);

  // 格式化时间
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    state,
    status,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    downloadRecording,
    reset,
    formatDuration,
  };
};

