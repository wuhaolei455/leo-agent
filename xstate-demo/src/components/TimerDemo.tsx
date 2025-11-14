import { useMachine } from '@xstate/react'
import { timerMachine } from '../machines/timerMachine'

export function TimerDemo() {
  const [state, send] = useMachine(timerMachine)

  const isIdle = state.matches('idle')
  const isRunning = state.matches('running')
  const isPaused = state.matches('paused')
  const isFinished = state.matches('finished')

  const { duration, elapsed } = state.context
  const progress = (elapsed / duration) * 100
  const remainingSeconds = Math.ceil((duration - elapsed) / 1000)

  return (
    <div className="demo-card">
      <h2>⏱️ 计时器状态机</h2>
      <p className="description">
        展示时间相关状态、after转换、延迟事件处理
      </p>

      <div className="state-indicator">
        当前状态: <span className="state-badge">{state.value as string}</span>
      </div>

      <div className="timer-display">
        <div className="timer-circle">
          <svg viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#4caf50"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.3s' }}
            />
          </svg>
          <div className="timer-text">
            {isFinished ? '完成!' : `${remainingSeconds}s`}
          </div>
        </div>
      </div>

      {isIdle && (
        <div className="duration-selector">
          <label>设置时长（秒）：</label>
          <div className="duration-buttons">
            {[10, 30, 60].map((seconds) => (
              <button
                key={seconds}
                onClick={() => send({ type: 'SET_DURATION', duration: seconds * 1000 })}
                className={duration === seconds * 1000 ? 'active' : ''}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="button-group">
        {isIdle && (
          <button onClick={() => send({ type: 'START' })}>
            开始
          </button>
        )}
        
        {isRunning && (
          <>
            <button onClick={() => send({ type: 'PAUSE' })}>
              暂停
            </button>
            <button onClick={() => send({ type: 'RESET' })} className="secondary">
              重置
            </button>
          </>
        )}
        
        {isPaused && (
          <>
            <button onClick={() => send({ type: 'RESUME' })}>
              继续
            </button>
            <button onClick={() => send({ type: 'RESET' })} className="secondary">
              重置
            </button>
          </>
        )}
        
        {isFinished && (
          <>
            <button onClick={() => send({ type: 'START' })}>
              重新开始
            </button>
            <button onClick={() => send({ type: 'RESET' })} className="secondary">
              返回
            </button>
          </>
        )}
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  )
}













