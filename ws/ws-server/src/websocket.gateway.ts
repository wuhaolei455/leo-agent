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
  private heartbeatTimeouts = new Map<string, NodeJS.Timeout>();
  private readonly HEARTBEAT_TIMEOUT = 20000; // 20s 未收到心跳则判定超时

  private scheduleHeartbeatTimeout(client: Socket) {
    this.clearHeartbeatTimeout(client.id);
    const timeout = setTimeout(() => {
      console.warn(`客户端 ${client.id} 心跳超时，主动断开连接`);
      client.disconnect();
      this.heartbeatTimeouts.delete(client.id);
    }, this.HEARTBEAT_TIMEOUT);
    this.heartbeatTimeouts.set(client.id, timeout);
  }

  private clearHeartbeatTimeout(clientId: string) {
    const timeout = this.heartbeatTimeouts.get(clientId);
    if (timeout) {
      clearTimeout(timeout);
      this.heartbeatTimeouts.delete(clientId);
    }
  }

  handleConnection(client: Socket) {
    console.log(`客户端已连接: ${client.id}`);
    this.connectedClients.set(client.id, client);
    this.scheduleHeartbeatTimeout(client);
    
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
    this.clearHeartbeatTimeout(client.id);
    
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
    this.scheduleHeartbeatTimeout(client);
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

