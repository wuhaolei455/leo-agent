import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AudioGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AudioGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`客户端连接: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`客户端断开: ${client.id}`);
  }

  @SubscribeMessage('audio-stream')
  handleAudioStream(
    @MessageBody() data: ArrayBuffer,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(
      `收到音频数据: ${data.byteLength} bytes from ${client.id}`,
    );

    // 暂时返回固定文字
    const response = {
      type: 'text-response',
      text: '收到您的语音，这是一个测试回复。',
      timestamp: new Date().toISOString(),
    };

    client.emit('audio-response', response);
  }

  @SubscribeMessage('start-recording')
  handleStartRecording(@ConnectedSocket() client: Socket): void {
    this.logger.log(`开始录音: ${client.id}`);
    client.emit('recording-started', { success: true });
  }

  @SubscribeMessage('stop-recording')
  handleStopRecording(@ConnectedSocket() client: Socket): void {
    this.logger.log(`停止录音: ${client.id}`);
    client.emit('recording-stopped', { success: true });
  }
}

