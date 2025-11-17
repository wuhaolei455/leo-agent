import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { Logger } from '@nestjs/common';
import * as WebSocket from 'ws';

interface AudioSession {
  clientId: string;
  startTime: number;
  audioChunks: Buffer[];
  isRecording: boolean;
  totalBytes: number;
}

interface WebSocketMessage {
  event: string;
  data: any;
}

// 扩展 WebSocket 类型以添加自定义属性
interface ExtendedWebSocket extends WebSocket {
  id?: string;
  isAlive?: boolean;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class AudioGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AudioGateway.name);
  private sessions = new Map<string, AudioSession>();
  private clients = new Map<string, ExtendedWebSocket>();

  // 模拟的AI响应消息库
  private readonly responseTemplates = [
    '收到您的语音消息，我理解您的意思了。',
    '这是一个很好的问题，让我思考一下。',
    '明白了，我会为您提供最佳的解决方案。',
    '感谢您的提问，我很乐意为您解答。',
    '我已经收到您的语音了，这个问题很有趣。',
  ];

  afterInit() {
    this.logger.log('WebSocket 网关已初始化');

    // 设置心跳检测
    const heartbeatInterval = setInterval(() => {
      this.server.clients.forEach((ws: ExtendedWebSocket) => {
        if (ws.isAlive === false) {
          this.logger.warn(`客户端 ${ws.id} 心跳超时，关闭连接`);
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 每30秒检查一次

    this.server.on('close', () => {
      clearInterval(heartbeatInterval);
    });
  }

  handleConnection(client: ExtendedWebSocket) {
    // 生成唯一ID
    const clientId = this.generateClientId();
    client.id = clientId;
    client.isAlive = true;

    this.clients.set(clientId, client);
    this.logger.log(`客户端连接: ${clientId}`);

    // 初始化会话
    this.sessions.set(clientId, {
      clientId: clientId,
      startTime: Date.now(),
      audioChunks: [],
      isRecording: false,
      totalBytes: 0,
    });

    // 处理心跳响应
    client.on('pong', () => {
      client.isAlive = true;
    });

    // 处理消息
    client.on('message', (message: Buffer) => {
      try {
        const data = message.toString();

        // 尝试解析为 JSON
        try {
          const parsedMessage: WebSocketMessage = JSON.parse(data);
          this.handleMessage(client, parsedMessage);
        } catch (e) {
          // 如果不是 JSON，可能是二进制音频数据
          this.logger.debug(`收到非JSON消息，长度: ${message.length}`);
        }
      } catch (error) {
        this.logger.error('处理消息失败:', error);
      }
    });

    // 发送连接成功通知
    this.sendMessage(client, 'connection-success', {
      clientId: clientId,
      serverTime: new Date().toISOString(),
    });
  }

  handleDisconnect(client: ExtendedWebSocket) {
    const clientId = client.id;
    if (!clientId) return;

    this.logger.log(`客户端断开: ${clientId}`);

    // 清理会话数据
    const session = this.sessions.get(clientId);
    if (session) {
      this.logger.log(
        `会话统计 - 总时长: ${Date.now() - session.startTime}ms, 总数据: ${session.totalBytes} bytes`,
      );
      this.sessions.delete(clientId);
    }

    this.clients.delete(clientId);
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(client: ExtendedWebSocket, message: WebSocketMessage) {
    const { event, data } = message;
    const clientId = client.id;

    if (!clientId) return;

    switch (event) {
      case 'audio-stream':
        this.handleAudioStream(clientId, data);
        break;
      case 'start-recording':
        this.handleStartRecording(client, clientId);
        break;
      case 'stop-recording':
        this.handleStopRecording(client, clientId);
        break;
      case 'test-message':
        this.handleTestMessage(client, data);
        break;
      case 'ping':
        this.sendMessage(client, 'pong', { timestamp: Date.now() });
        break;
      default:
        this.logger.warn(`未知事件: ${event}`);
    }
  }

  /**
   * 处理音频流数据
   */
  private handleAudioStream(clientId: string, data: any): void {
    const session = this.sessions.get(clientId);
    if (!session || !session.isRecording) {
      return;
    }

    // 处理音频数据（可能是 Base64 编码或 ArrayBuffer）
    let buffer: Buffer;
    if (typeof data === 'string') {
      buffer = Buffer.from(data, 'base64');
    } else if (Buffer.isBuffer(data)) {
      buffer = data;
    } else if (data.type === 'Buffer' && Array.isArray(data.data)) {
      buffer = Buffer.from(data.data);
    } else {
      this.logger.warn('不支持的音频数据格式');
      return;
    }

    session.audioChunks.push(buffer);
    session.totalBytes += buffer.length;

    this.logger.debug(
      `收到音频流: ${buffer.length} bytes (总计: ${session.totalBytes} bytes)`,
    );
  }

  /**
   * 开始录音
   */
  private handleStartRecording(client: ExtendedWebSocket, clientId: string): void {
    this.logger.log(`开始录音: ${clientId}`);

    const session = this.sessions.get(clientId);
    if (session) {
      session.isRecording = true;
      session.audioChunks = [];
      session.totalBytes = 0;

      this.sendMessage(client, 'recording-started', {
        success: true,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 停止录音
   */
  private handleStopRecording(client: ExtendedWebSocket, clientId: string): void {
    this.logger.log(`停止录音: ${clientId}`);

    const session = this.sessions.get(clientId);
    if (!session) {
      return;
    }

    session.isRecording = false;

    // 处理音频数据
    if (session.audioChunks.length > 0) {
      this.processAudio(client, session);
    }

    this.sendMessage(client, 'recording-stopped', {
      success: true,
      timestamp: new Date().toISOString(),
      totalBytes: session.totalBytes,
    });
  }

  /**
   * 处理测试消息
   */
  private handleTestMessage(client: ExtendedWebSocket, data: any): void {
    this.logger.log(`收到测试消息: ${JSON.stringify(data)}`);

    this.sendMessage(client, 'test-response', {
      received: data,
      serverTime: new Date().toISOString(),
    });
  }

  /**
   * 处理音频并返回响应
   */
  private processAudio(client: ExtendedWebSocket, session: AudioSession): void {
    // 模拟处理延迟
    const processingTime = 300 + Math.random() * 500; // 300-800ms

    setTimeout(() => {
      // 随机选择一个响应
      const randomIndex = Math.floor(
        Math.random() * this.responseTemplates.length,
      );
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
        `发送响应给 ${session.clientId}: "${responseText}" (预计时长: ${estimatedDuration}ms)`,
      );

      this.sendMessage(client, 'audio-response', response);

      // 清空音频缓存
      session.audioChunks = [];
      session.totalBytes = 0;
    }, processingTime);
  }

  /**
   * 发送消息到客户端
   */
  private sendMessage(client: ExtendedWebSocket, event: string, data: any): void {
    if (client.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = { event, data };
      client.send(JSON.stringify(message));
    } else {
      this.logger.warn(`客户端 ${client.id} 未连接，无法发送消息`);
    }
  }

  /**
   * 生成客户端ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
