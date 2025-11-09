import { useMachine } from '@xstate/react'
import { wizardMachine } from '../machines/wizardMachine'

export function WizardDemo() {
  const [state, send] = useMachine(wizardMachine)

  const currentStep = state.value as string
  const { step1Data, step2Data, step3Data } = state.context

  const isStep1 = currentStep === 'step1'
  const isStep2 = currentStep === 'step2'
  const isStep3 = currentStep === 'step3'
  const isReview = currentStep === 'review'
  const isSubmitting = currentStep === 'submitting'
  const isComplete = currentStep === 'complete'

  const steps = [
    { id: 'step1', label: '个人信息' },
    { id: 'step2', label: '地址信息' },
    { id: 'step3', label: '偏好设置' },
    { id: 'review', label: '确认' },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <div className="demo-card wizard-demo">
      <h2>🧭 多步骤向导状态机</h2>
      <p className="description">
        展示顺序状态流转、历史状态、条件导航和数据收集
      </p>

      {!isComplete && (
        <div className="wizard-progress">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`progress-step ${index <= currentStepIndex ? 'active' : ''} ${
                index === currentStepIndex ? 'current' : ''
              }`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="wizard-content">
        {isStep1 && (
          <div className="wizard-step">
            <h3>步骤 1: 个人信息</h3>
            <div className="form-field">
              <label>姓名：</label>
              <input
                type="text"
                value={step1Data.name}
                onChange={(e) =>
                  send({ type: 'UPDATE_STEP1', data: { name: e.target.value } })
                }
                placeholder="请输入姓名"
              />
            </div>
            <div className="form-field">
              <label>年龄：</label>
              <input
                type="number"
                value={step1Data.age}
                onChange={(e) =>
                  send({ type: 'UPDATE_STEP1', data: { age: e.target.value } })
                }
                placeholder="请输入年龄"
              />
            </div>
          </div>
        )}

        {isStep2 && (
          <div className="wizard-step">
            <h3>步骤 2: 地址信息</h3>
            <div className="form-field">
              <label>城市：</label>
              <input
                type="text"
                value={step2Data.city}
                onChange={(e) =>
                  send({ type: 'UPDATE_STEP2', data: { city: e.target.value } })
                }
                placeholder="请输入城市"
              />
            </div>
            <div className="form-field">
              <label>国家：</label>
              <input
                type="text"
                value={step2Data.country}
                onChange={(e) =>
                  send({ type: 'UPDATE_STEP2', data: { country: e.target.value } })
                }
                placeholder="请输入国家"
              />
            </div>
          </div>
        )}

        {isStep3 && (
          <div className="wizard-step">
            <h3>步骤 3: 偏好设置</h3>
            <div className="form-field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={step3Data.subscribe}
                  onChange={(e) =>
                    send({ type: 'UPDATE_STEP3', data: { subscribe: e.target.checked } })
                  }
                />
                订阅邮件通知
              </label>
            </div>
            <div className="form-field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={step3Data.terms}
                  onChange={(e) =>
                    send({ type: 'UPDATE_STEP3', data: { terms: e.target.checked } })
                  }
                />
                <span className="required">* 同意服务条款</span>
              </label>
            </div>
          </div>
        )}

        {isReview && (
          <div className="wizard-step review-step">
            <h3>确认信息</h3>
            <div className="review-section">
              <h4>个人信息</h4>
              <p>姓名: {step1Data.name}</p>
              <p>年龄: {step1Data.age}</p>
              <button
                className="edit-button"
                onClick={() => send({ type: 'GOTO', step: 'step1' })}
              >
                编辑
              </button>
            </div>
            <div className="review-section">
              <h4>地址信息</h4>
              <p>城市: {step2Data.city}</p>
              <p>国家: {step2Data.country}</p>
              <button
                className="edit-button"
                onClick={() => send({ type: 'GOTO', step: 'step2' })}
              >
                编辑
              </button>
            </div>
            <div className="review-section">
              <h4>偏好设置</h4>
              <p>订阅邮件: {step3Data.subscribe ? '是' : '否'}</p>
              <p>同意条款: {step3Data.terms ? '是' : '否'}</p>
              <button
                className="edit-button"
                onClick={() => send({ type: 'GOTO', step: 'step3' })}
              >
                编辑
              </button>
            </div>
          </div>
        )}

        {isSubmitting && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>提交中...</p>
          </div>
        )}

        {isComplete && (
          <div className="success-state">
            <h3>✅ 提交成功！</h3>
            <p>您的信息已成功提交</p>
            <button onClick={() => send({ type: 'RESTART' })}>重新开始</button>
          </div>
        )}
      </div>

      {!isComplete && !isSubmitting && (
        <div className="wizard-actions">
          {!isStep1 && !isReview && (
            <button onClick={() => send({ type: 'BACK' })} className="secondary">
              上一步
            </button>
          )}
          {isReview && (
            <button onClick={() => send({ type: 'BACK' })} className="secondary">
              返回
            </button>
          )}
          {!isReview && (
            <button onClick={() => send({ type: 'NEXT' })}>
              下一步
            </button>
          )}
          {isReview && (
            <button onClick={() => send({ type: 'SUBMIT' })}>
              提交
            </button>
          )}
        </div>
      )}
    </div>
  )
}












