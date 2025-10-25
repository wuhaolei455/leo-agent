import { FormEvent, KeyboardEvent, useCallback } from 'react'

import './MessageComposer.css'

interface MessageComposerProps {
  userInput: string
  setUserInput: (value: string) => void
  onSend: () => void
  isLoading: boolean
  remainTimes: number
}

export function MessageComposer({
  userInput,
  setUserInput,
  onSend,
  isLoading,
  remainTimes
}: MessageComposerProps) {

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSend()
  }, [onSend])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送，Shift+Enter 换行
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }, [onSend])

  const isDisabled = remainTimes <= 0

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      <textarea
        className="message-composer__input"
        value={userInput}
        placeholder={remainTimes > 0 ? '输入你的问题' : '今日额度已用完'}
        disabled={isDisabled}
        rows={1}
        onChange={event => setUserInput(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="submit"
        className="message-composer__submit"
        disabled={!userInput.trim() || isDisabled}
      >
        {isLoading ? '发送中…' : '发送'}
      </button>
    </form>
  )
}
