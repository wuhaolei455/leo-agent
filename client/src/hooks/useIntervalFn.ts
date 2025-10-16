import { useRef, useCallback } from 'react'

export const useIntervalFn = (fn: () => void, interval = 1000) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const resume = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    timerRef.current = setInterval(fn, interval)
  }, [fn, interval])

  const pause = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stop = pause

  return { resume, pause, stop }
}