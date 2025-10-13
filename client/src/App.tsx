import { FormEvent, useEffect, useRef, useState } from 'react';
import './App.css';

type StreamChunk = {
  id?: number;
  chunk?: string;
  done?: boolean;
};

function App() {
  const [prompt, setPrompt] = useState('介绍一下大模型是如何进行多轮对话的');
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

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

    const url = `http://localhost:3002/chat/stream?prompt=${encodeURIComponent(
      prompt,
    )}`;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const payload: StreamChunk = JSON.parse(event.data);

        if (payload.done) {
          stopStream();
          return;
        }

        if (payload.chunk) {
          setOutput((prev) => prev + payload.chunk);
        }
      } catch (err) {
        console.error('解析数据失败', err);
      }
    };

    eventSource.onerror = () => {
      setError('连接出现问题，已停止流式输出');
      stopStream();
    };
  };

  const stopStream = () => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setIsStreaming(false);
  };

  return (
    <div className="app">
      <main className="panel">
        <section className="panel__header">
          <h1>大模型流式输出演示</h1>
          <p>服务端使用 NestJS 模拟大模型逐词回复，前端通过 Server-Sent Events 进行实时展示。</p>
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
