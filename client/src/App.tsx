import { FormEvent, useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('介绍一下大模型是如何进行多轮对话的');
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const abortControllerRef = useRef<AbortController | null>(null);
  const manualStopRef = useRef(false);

  useEffect(() => {
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startStream();
  };

  const startStream = () => {
    if (!prompt.trim()) {
      setError('请输入提问内容');
      return;
    }

    if (isStreaming) {
      return;
    }

    setIsStreaming(true);
    setOutput('');
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    manualStopRef.current = false;

    void fetchStream(prompt, method, controller.signal);
  };

  const stopStream = () => {
    if (abortControllerRef.current) {
      manualStopRef.current = true;
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const fetchStream = async (
    message: string,
    requestMethod: 'GET' | 'POST',
    signal: AbortSignal,
  ) => {
    try {
      const url = new URL('http://localhost:3002/chat/stream');
      const init: RequestInit = {
        method: requestMethod,
        signal,
      };

      if (requestMethod === 'GET') {
        // get
        url.searchParams.set('prompt', message);
      } else {
        // post
        init.headers = { 'Content-Type': 'application/json' };
        init.body = JSON.stringify({ prompt: message });
      }

      const response = await fetch(url, init);

      if (!response.body) {
        throw new Error('浏览器不支持 ReadableStream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';
      let stopByDone = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone ?? false;

        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          if (chunk) {
            buffer += chunk;

            let separatorIndex = buffer.indexOf('\n\n');
            while (separatorIndex !== -1) {
              const rawEvent = buffer.slice(0, separatorIndex);
              buffer = buffer.slice(separatorIndex + 2);
              separatorIndex = buffer.indexOf('\n\n');

              const { event, data } = parseSSEEvent(rawEvent);

              if (event === 'error') {
                throw new Error(data || '服务器返回错误');
              }

              if (data === '[DONE]') {
                stopByDone = true;
                done = true;
                break;
              }

              if (data) {
                setOutput((prev) => prev + data);
              }
            }
          }
        }
        if (stopByDone) {
          break;
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError' && manualStopRef.current) {
        return;
      }
      setError((err as Error).message ?? '请求失败');
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const parseSSEEvent = (raw: string): { event: string; data: string } => {
    const lines = raw.split('\n');
    let eventType = 'message';
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    return { event: eventType, data: dataLines.join('\n') };
  };

  return (
    <div className="app">
      <main className="panel">
        <section className="panel__header">
          <h1>大模型流式输出演示</h1>
          <p>
            可在 GET 与 POST 接口之间切换，体验基于 fetch + ReadableStream 的 SSE 流式展示。
          </p>
        </section>

        <section className="panel__form">
          <form onSubmit={handleSubmit}>
            <label htmlFor="prompt">输入提示词</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="请输入你的问题..."
              rows={4}
            />
            <label htmlFor="method">接口方式</label>
            <select
              id="method"
              value={method}
              onChange={(event) =>
                setMethod(event.target.value === 'GET' ? 'GET' : 'POST')
              }
              disabled={isStreaming}
            >
              <option value="GET">GET /chat/stream</option>
              <option value="POST">POST /chat/stream</option>
            </select>
            <div className="panel__actions">
              <button type="submit" disabled={isStreaming}>
                {isStreaming ? '生成中...' : '开始生成'}
              </button>
              <button type="button" disabled={!isStreaming} onClick={stopStream}>
                停止
              </button>
            </div>
          </form>
          {error && <p className="panel__error">{error}</p>}
        </section>

        <section className="panel__output">
          <h2>流式输出</h2>
          <div className={`output ${isStreaming ? 'output--active' : ''}`}>
            {output ? output : '等待生成内容...'}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
