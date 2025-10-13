import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AppService {
  streamResponse(prompt: string): Observable<string> {
    const response = this.buildResponse(prompt);
    const tokens = this.tokenizeResponse(response);

    return new Observable<string>((observer) => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < tokens.length) {
          observer.next(tokens[index]);
          index += 1;
          return;
        }

        clearInterval(interval);
        observer.complete();
      }, 160);

      return () => clearInterval(interval);
    });
  }

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
      '本演示现在通过最基础的 chunked 响应模拟流式返回，方便前端使用 fetch 逐步读取。',
      '实际模型会结合更多记忆、工具和反馈循环，这里仅展示核心流程。',
    ].join('\n');
  }

  private tokenizeResponse(response: string): string[] {
    return response.split(/(\s+)/).filter((token) => token.length > 0);
  }
}
