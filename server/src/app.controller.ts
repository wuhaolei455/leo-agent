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
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const subscription = this.appService.streamResponse(prompt).subscribe({
      next: (chunk) => {
        res.write(`data: ${chunk}\n\n`);
        res.flush?.();
      },
      error: (err) => {
        const message = err instanceof Error ? err.message : String(err);
        res.write(`event: error\ndata: ${message}\n\n`);
        res.end();
      },
      complete: () => {
        res.write('data: [DONE]\n\n');
        res.end();
      },
    });

    res.on('close', () => {
      subscription.unsubscribe();
    });
  }
}
