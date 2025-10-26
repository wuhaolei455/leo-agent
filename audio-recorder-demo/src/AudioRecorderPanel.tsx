import React from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import { RecorderStatus } from './types';
import './AudioRecorderPanel.css';

export const AudioRecorderPanel: React.FC = () => {
  const {
    state,
    status,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    playRecording,
    downloadRecording,
    reset,
    formatDuration,
  } = useAudioRecorder();

  const getStatusText = () => {
    switch (status) {
      case RecorderStatus.RECORDING:
        return '正在录音';
      case RecorderStatus.PAUSED:
        return '已暂停';
      case RecorderStatus.STOPPED:
        return '录音完成';
      default:
        return '准备就绪';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case RecorderStatus.RECORDING:
        return 'recording';
      case RecorderStatus.PAUSED:
        return 'paused';
      case RecorderStatus.STOPPED:
        return 'stopped';
      default:
        return 'idle';
    }
  };

  return (
    <div className="audio-recorder-panel">
      <div className="recorder-header">
        <h2>🎙️ 音频录制器</h2>
        <p>使用 js-audio-recorder 实现的音频录制功能</p>
      </div>

      <div className="recorder-status">
        <div className="status-indicator">
          <span className={`status-dot ${getStatusClass()}`}></span>
          <span>{getStatusText()}</span>
        </div>
      </div>

      <div className="recorder-duration">
        <div className="duration-display">
          {formatDuration(state.duration)}
        </div>
      </div>

      <div className="recorder-controls">
        {!state.isRecording && status === RecorderStatus.IDLE && (
          <button
            className="control-btn btn-start"
            onClick={startRecording}
          >
            ▶️ 开始录音
          </button>
        )}

        {state.isRecording && !state.isPaused && (
          <>
            <button
              className="control-btn btn-pause"
              onClick={pauseRecording}
            >
              ⏸️ 暂停
            </button>
            <button
              className="control-btn btn-stop"
              onClick={stopRecording}
            >
              ⏹️ 停止
            </button>
          </>
        )}

        {state.isPaused && (
          <>
            <button
              className="control-btn btn-resume"
              onClick={resumeRecording}
            >
              ▶️ 继续
            </button>
            <button
              className="control-btn btn-stop"
              onClick={stopRecording}
            >
              ⏹️ 停止
            </button>
          </>
        )}

        {status === RecorderStatus.STOPPED && state.audioUrl && (
          <>
            <button
              className="control-btn btn-play"
              onClick={playRecording}
            >
              🔊 播放
            </button>
            <button
              className="control-btn btn-download"
              onClick={() => downloadRecording(`recording_${Date.now()}.wav`)}
            >
              💾 下载
            </button>
            <button
              className="control-btn btn-reset"
              onClick={reset}
            >
              🔄 重新录制
            </button>
          </>
        )}
      </div>

      {state.audioUrl && (
        <div className="recorder-audio-player">
          <h3>录音预览</h3>
          <audio controls src={state.audioUrl}>
            您的浏览器不支持音频播放
          </audio>
        </div>
      )}

      <div className="recorder-info">
        <strong>📝 使用说明：</strong>
        <ul>
          <li>点击"开始录音"按钮开始录制音频</li>
          <li>录音过程中可以暂停和继续</li>
          <li>点击"停止"按钮结束录音</li>
          <li>录音完成后可以播放、下载或重新录制</li>
          <li>录音格式：WAV，采样率：16000Hz，单声道</li>
        </ul>
      </div>
    </div>
  );
};

