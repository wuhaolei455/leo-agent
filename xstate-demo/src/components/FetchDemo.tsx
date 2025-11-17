import { useMachine } from '@xstate/react'
import { fetchMachine } from '../machines/fetchMachine'

export function FetchDemo() {
  const [state, send] = useMachine(fetchMachine)

  const isIdle = state.matches('idle')
  const isLoading = state.matches('loading')
  const isSuccess = state.matches('success')
  const isFailure = state.matches('failure')

  return (
    <div className="demo-card">
      <h2>🌐 数据获取状态机</h2>
      <p className="description">
        展示异步操作、重试逻辑、取消操作和错误恢复
      </p>

      <div className="state-indicator">
        当前状态: <span className="state-badge">{state.value as string}</span>
        {state.context.retryCount > 0 && (
          <span className="retry-count"> (重试次数: {state.context.retryCount}/3)</span>
        )}
      </div>

      <div className="button-group">
        {isIdle && (
          <button onClick={() => send({ type: 'FETCH' })}>
            获取用户列表
          </button>
        )}
        
        {isLoading && (
          <button onClick={() => send({ type: 'CANCEL' })}>
            取消请求
          </button>
        )}
        
        {isSuccess && (
          <button onClick={() => send({ type: 'REFRESH' })}>
            刷新数据
          </button>
        )}
        
        {isFailure && (
          <>
            <button 
              onClick={() => send({ type: 'RETRY' })}
              disabled={state.context.retryCount >= 3}
            >
              重试
            </button>
            <button onClick={() => send({ type: 'FETCH' })}>
              重新开始
            </button>
          </>
        )}
      </div>

      {isLoading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>加载中... (第 {state.context.retryCount + 1} 次尝试)</p>
        </div>
      )}

      {isFailure && (
        <div className="error-message">
          ❌ {state.context.error}
        </div>
      )}

      {isSuccess && (
        <div className="user-list">
          <h3>用户列表:</h3>
          <ul>
            {state.context.users.map((user) => (
              <li key={user.id}>
                <strong>{user.name}</strong> - {user.email}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="hint">
        💡 提示: 前两次请求会失败，第三次才会成功（展示重试逻辑）
      </div>
    </div>
  )
}














