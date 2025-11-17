import { useMachine } from '@xstate/react'
import { formMachine } from '../machines/formMachine'

export function FormDemo() {
  const [state, send] = useMachine(formMachine)

  const isEditing = state.matches('editing')
  const isSubmitting = state.matches('submitting')
  const isSuccess = state.matches('success')

  const { email, password, confirmPassword, submissionError } = state.context

  return (
    <div className="demo-card">
      <h2>📝 表单验证状态机</h2>
      <p className="description">
        展示嵌套状态、实时验证、字段级错误处理
      </p>

      <div className="state-indicator">
        当前状态: <span className="state-badge">{state.value as string}</span>
      </div>

      {!isSuccess ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send({ type: 'SUBMIT' })
          }}
          className="validation-form"
        >
          <div className="form-field">
            <label htmlFor="email">邮箱：</label>
            <input
              id="email"
              type="email"
              value={email.value}
              onChange={(e) => send({ type: 'UPDATE_EMAIL', value: e.target.value })}
              onBlur={() => send({ type: 'BLUR_EMAIL' })}
              className={email.error && email.touched ? 'error' : ''}
              disabled={isSubmitting}
            />
            {email.error && email.touched && (
              <span className="field-error">{email.error}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="password">密码：</label>
            <input
              id="password"
              type="password"
              value={password.value}
              onChange={(e) => send({ type: 'UPDATE_PASSWORD', value: e.target.value })}
              onBlur={() => send({ type: 'BLUR_PASSWORD' })}
              className={password.error && password.touched ? 'error' : ''}
              disabled={isSubmitting}
            />
            {password.error && password.touched && (
              <span className="field-error">{password.error}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">确认密码：</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword.value}
              onChange={(e) => send({ type: 'UPDATE_CONFIRM_PASSWORD', value: e.target.value })}
              onBlur={() => send({ type: 'BLUR_CONFIRM_PASSWORD' })}
              className={confirmPassword.error && confirmPassword.touched ? 'error' : ''}
              disabled={isSubmitting}
            />
            {confirmPassword.error && confirmPassword.touched && (
              <span className="field-error">{confirmPassword.error}</span>
            )}
          </div>

          {submissionError && (
            <div className="error-message">❌ {submissionError}</div>
          )}

          <button type="submit" disabled={isSubmitting || !isEditing}>
            {isSubmitting ? '提交中...' : '提交'}
          </button>
        </form>
      ) : (
        <div className="success-state">
          <p>✅ 表单提交成功！</p>
          <button onClick={() => send({ type: 'RESET' })}>重新填写</button>
        </div>
      )}

      <div className="hint">
        💡 提示: 密码至少6个字符，有10%的概率模拟提交失败
      </div>
    </div>
  )
}














