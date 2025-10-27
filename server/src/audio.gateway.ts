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

interface AudioSession {
  clientId: string;
  startTime: number;
  audioChunks: Buffer[];
  isRecording: boolean;
  totalBytes: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AudioGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AudioGateway.name);
  private sessions = new Map<string, AudioSession>();

  // 模拟的AI响应消息库
  private readonly responseTemplates = [
    '收到您的语音消息，我理解您的意思了。',
    '这是一个很好的问题，让我思考一下。',
    '明白了，我会为您提供最佳的解决方案。',
    '感谢您的提问，我很乐意为您解答。',
    '我已经收到您的语音了，这个问题很有趣。',
  ];

  handleConnection(client: Socket) {
    this.logger.log(`客户端连接: ${client.id}`);
    
    // 初始化会话
    this.sessions.set(client.id, {
      clientId: client.id,
      startTime: Date.now(),
      audioChunks: [],
      isRecording: false,
      totalBytes: 0,
    });

    // 发送连接成功通知
    client.emit('connection-success', {
      clientId: client.id,
      serverTime: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`客户端断开: ${client.id}`);
    
    // 清理会话数据
    const session = this.sessions.get(client.id);
    if (session) {
      this.logger.log(
        `会话统计 - 总时长: ${Date.now() - session.startTime}ms, 总数据: ${session.totalBytes} bytes`,
      );
      this.sessions.delete(client.id);
    }
  }

  @SubscribeMessage('audio-stream')
  handleAudioStream(
    @MessageBody() data: ArrayBuffer,
    @ConnectedSocket() client: Socket,
  ): void {
    const session = this.sessions.get(client.id);
    if (!session || !session.isRecording) {
      return;
    }

    // 累计音频数据
    const buffer = Buffer.from(data);
    session.audioChunks.push(buffer);
    session.totalBytes += buffer.length;

    this.logger.debug(
      `收到音频流: ${buffer.length} bytes (总计: ${session.totalBytes} bytes)`,
    );
  }

  @SubscribeMessage('start-recording')
  handleStartRecording(@ConnectedSocket() client: Socket): void {
    this.logger.log(`开始录音: ${client.id}`);
    
    const session = this.sessions.get(client.id);
    if (session) {
      session.isRecording = true;
      session.audioChunks = [];
      session.totalBytes = 0;
      
      client.emit('recording-started', { 
        success: true,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('stop-recording')
  handleStopRecording(@ConnectedSocket() client: Socket): void {
    this.logger.log(`停止录音: ${client.id}`);
    
    const session = this.sessions.get(client.id);
    if (!session) {
      return;
    }

    session.isRecording = false;

    // 处理音频数据
    if (session.audioChunks.length > 0) {
      this.processAudio(client, session);
    }

    client.emit('recording-stopped', { 
      success: true,
      timestamp: new Date().toISOString(),
      totalBytes: session.totalBytes,
    });
  }

  /**
   * 处理音频并返回响应
   */
  private processAudio(client: Socket, session: AudioSession): void {
    // 模拟处理延迟
    const processingTime = 300 + Math.random() * 500; // 300-800ms

    setTimeout(() => {
      // 随机选择一个响应
      const randomIndex = Math.floor(Math.random() * this.responseTemplates.length);
      const responseText = this.responseTemplates[randomIndex];

      // 根据文本长度估算说话时间 (中文约每字100ms)
      const estimatedDuration = responseText.length * 100;

      const response = {
        type: 'text-response',
        text: responseText,
        timestamp: new Date().toISOString(),
        duration: estimatedDuration,
        audioSize: session.totalBytes,
        processingTime: Math.round(processingTime),
      };

      this.logger.log(
        `发送响应给 ${client.id}: "${responseText}" (预计时长: ${estimatedDuration}ms)`,
      );

      client.emit('audio-response', response);

      // 清空音频缓存
      session.audioChunks = [];
      session.totalBytes = 0;
    }, processingTime);
  }

  /**
   * 测试消息 - 用于调试
   */
  @SubscribeMessage('test-message')
  handleTestMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(`收到测试消息: ${JSON.stringify(data)}`);
    
    client.emit('test-response', {
      received: data,
      serverTime: new Date().toISOString(),
    });
  }
}

