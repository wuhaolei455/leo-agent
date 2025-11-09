import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebSocketGateway } from './websocket.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, WebSocketGateway],
})
export class AppModule {}

