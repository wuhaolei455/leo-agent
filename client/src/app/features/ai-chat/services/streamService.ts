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
 * 使用 fetch ReadableStream 实现 SSE 流式输出
 * 这种方式更灵活，支持 POST 请求和自定义 headers
 */
export async function streamChat(prompt: string, options: StreamOptions): Promise<() => void> {
  const { onMessage, onComplete, onError } = options
  
  const controller = new AbortController()
  
  try {
    const response = await fetch('http://localhost:3002/chat/stream', {
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

    // 递归读取流
    const readStream = async () => {
      try {
        const { done, value } = await reader.read()
        
        if (done) {
          onComplete()
          return
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

        // 继续读取下一块
        await readStream()
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
 */
export function streamChatWithEventSource(
  prompt: string,
  options: StreamOptions
): () => void {
  const { onMessage, onComplete, onError } = options
  
  const url = `http://localhost:3002/chat/stream?prompt=${encodeURIComponent(prompt)}`
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

