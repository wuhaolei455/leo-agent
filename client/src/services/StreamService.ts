import { HollySSE, HollySSEOptions } from 'holly-sse'

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location
    return `${protocol}//${hostname}:3002`
  }
  return 'http://localhost:3002'
}

export function createChatStream(
  prompt: string,
  options: Omit<HollySSEOptions, 'method' | 'payload'>
): HollySSE {
  const apiUrl = getApiBaseUrl()
  
  return new HollySSE(`${apiUrl}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify({ prompt }),
    autoReconnect: false,
    ...options
  })
}

