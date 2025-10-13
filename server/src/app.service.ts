import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AppService {
  streamResponse(prompt: string): Observable<MessageEvent> {
    const response = this.buildResponse(prompt);
    const tokens = this.tokenizeResponse(response);

    return new Observable<MessageEvent>((observer) => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < tokens.length) {
          observer.next({
            data: JSON.stringify({
              id: index,
              chunk: tokens[index],
              done: false,
            }),
          });
          index += 1;
          return;
        }

        observer.next({ data: JSON.stringify({ done: true }) });
        clearInterval(interval);
        observer.complete();
      }, 180);

      return () => clearInterval(interval);
    });
  }

  // Stream Response
  private buildResponse(prompt: string): string {
    const question =
      prompt.trim().length > 0 ? `“${prompt.trim()}”` : '（未提供提示词）';

    return [
      `收到你的提问：${question}。下面是一个模拟的大模型流式回复。`,
      '',
      '1. 解析问题：识别语义、意图以及上下文，确定回答范围。',
      '2. 检索知识：根据意图调取知识库或工具结果，构建关键信息片段。',
      '3. 生成草稿：通过语言模型组合信息，得到候选回答。',
      '4. 优化润色：对输出进行逻辑检查、排版和安全过滤，提升可读性。',
      '',
      '本演示使用 Server-Sent Events，让前端能实时渲染逐步返回的文本，模拟真实大模型的推理过程。',
      '在真实场景中，模型会利用更多上下文和反馈循环，这里仅展示基础流程。',
    ].join('\n');
  }

  private tokenizeResponse(response: string): string[] {
    return response.split(/(\s+)/).filter((token) => token.length > 0);
  }
}
