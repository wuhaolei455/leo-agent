/**
 * SSE 流式输出服务
 * 使用 EventSource 或 fetch ReadableStream 实现流式消息接收
 */

export interface StreamOptions {
  onMessage: (chunk: string) => void
  onComplete: () => void
  onError: (error: Error) => void
}

/**
 * 获取 API 基础 URL
 * 开发环境：使用当前主机名和端口 3002
 * 这样可以在手机上通过电脑 IP 访问
 */
function getApiBaseUrl(): string {
  // 如果是 localhost，在生产环境可能需要替换为实际 IP
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location
    // 开发环境：使用当前主机名 + 3002 端口
    // 如果前端运行在 localhost:3000，后端在 localhost:3002
    // 如果前端运行在 192.168.1.100:3000，后端在 192.168.1.100:3002
    return `${protocol}//${hostname}:3002`
  }
  return 'http://localhost:3002'
}

/**
 * 使用 fetch ReadableStream 实现 SSE 流式输出
 * 这种方式更灵活，支持 POST 请求和自定义 headers
 * 改进：使用循环代替递归，提升移动端兼容性
 */
export async function streamChat(prompt: string, options: StreamOptions): Promise<() => void> {
  const { onMessage, onComplete, onError } = options
  
  const controller = new AbortController()
  const apiUrl = getApiBaseUrl()
  
  try {
    const response = await fetch(`${apiUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('ReadableStream not supported')
    }

    const decoder = new TextDecoder()
    let buffer = '' // 用于缓存未完整的行

    // 🎯 使用循环代替递归，避免移动端堆栈问题
    const readStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            onComplete()
            break
          }

          // 解码数据块并追加到缓冲区
          buffer += decoder.decode(value, { stream: true })
          
          // 按行分割（保留未完整的行在缓冲区）
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // 最后一行可能不完整，保留在缓冲区
          
          // 解析 SSE 格式: "data: xxx"
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6) // 移除 "data: " 前缀
              
              if (data === '[DONE]') {
                onComplete()
                return
              }
              
              if (data.trim()) {
                onMessage(data)
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          onError(err)
        }
      }
    }

    // 开始读取
    readStream()

  } catch (err) {
    if (err instanceof Error && err.name !== 'AbortError') {
      onError(err)
    }
  }

  // 返回取消函数
  return () => {
    controller.abort()
  }
}

/**
 * 使用 EventSource 实现 SSE (仅支持 GET 请求)
 * 备选方案，如果需要简单的 GET 请求可以使用
 * 这种方式在移动端兼容性更好
 */
export function streamChatWithEventSource(
  prompt: string,
  options: StreamOptions
): () => void {
  const { onMessage, onComplete, onError } = options
  
  const apiUrl = getApiBaseUrl()
  const url = `${apiUrl}/chat/stream?prompt=${encodeURIComponent(prompt)}`
  const eventSource = new EventSource(url)

  eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
      onComplete()
      eventSource.close()
      return
    }
    onMessage(event.data)
  }

  eventSource.onerror = (error) => {
    onError(new Error('EventSource error'))
    eventSource.close()
  }

  // 返回取消函数
  return () => {
    eventSource.close()
  }
}

