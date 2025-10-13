import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';

type StreamResponse = Response & {
  flush?: () => void;
  flushHeaders?: () => void;
};

@Controller('chat')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('stream')
  streamGet(@Query('prompt') prompt = '', @Res() res: StreamResponse) {
    this.handleStream(prompt, res);
  }

  @Post('stream')
  streamPost(@Body('prompt') prompt = '', @Res() res: StreamResponse) {
    this.handleStream(prompt, res);
  }

  private handleStream(prompt: string, res: StreamResponse) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.flushHeaders?.();

    const subscription = this.appService.streamResponse(prompt).subscribe({
      next: (chunk) => {
        res.write(chunk);
        res.flush?.();
      },
      error: (err) => {
        res
          .status(500)
          .end(`发生错误: ${err instanceof Error ? err.message : err}`);
      },
      complete: () => {
        res.end();
      },
    });

    res.on('close', () => {
      subscription.unsubscribe();
    });
  }
}
