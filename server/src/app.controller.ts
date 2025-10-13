import { Controller, MessageEvent, Query, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppService } from './app.service';

@Controller('chat')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Sse('stream')
  stream(@Query('prompt') prompt = ''): Observable<MessageEvent> {
    return this.appService.streamResponse(prompt);
  }
}
