import {
  WebSocketGateway as NestWebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@NestWebSocketGateway({
  cors: {
    origin: 'http://localhost:8000',
    credentials: true,
  },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, Socket>();
  private pingInterval: NodeJS.Timeout | null = null;

  handleConnection(client: Socket) {
    console.log(`客户端已连接: ${client.id}`);
    this.connectedClients.set(client.id, client);
    
    // 发送欢迎消息
    client.emit('welcome', {
      message: '欢迎连接到WebSocket服务器',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });

    // 广播在线人数
    this.broadcastOnlineCount();
  }

  handleDisconnect(client: Socket) {
    console.log(`客户端已断开: ${client.id}`);
    this.connectedClients.delete(client.id);
    
    // 广播在线人数
    this.broadcastOnlineCount();
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(`收到来自客户端 ${client.id} 的消息:`, data);
    
    // 回显消息给发送者
    client.emit('message-response', {
      original: data,
      response: `服务器收到: ${JSON.stringify(data)}`,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    console.log(`收到客户端 ${client.id} 的ping`);
    client.emit('pong', {
      timestamp: new Date().toISOString(),
    });
    clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      client.disconnect();
      console.log('断开客户端', client.id);
    }, 15000);
  }

  @SubscribeMessage('broadcast')
  handleBroadcast(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(`广播消息来自 ${client.id}:`, data);
    
    // 发送给所有客户端（包括发送者）
    this.server.emit('broadcast', {
      from: client.id,
      message: data,
      timestamp: new Date().toISOString(),
    });
  }

  private broadcastOnlineCount() {
    const count = this.connectedClients.size;
    this.server.emit('online-count', {
      count,
      timestamp: new Date().toISOString(),
    });
  }
}

