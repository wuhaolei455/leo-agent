# WebSocket Demo

一个完整的 WebSocket 演示项目，包含 NestJS 服务器和 React 客户端。

## 项目结构

```
ws/
├── ws-server/          # NestJS 服务器 (端口 9000)
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── websocket.gateway.ts
│   ├── package.json
│   └── README.md
├── ws-client/          # React 客户端 (端口 8000)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.tsx
│   │   ├── index.css
│   │   └── hooks/
│   │       └── useWebSocket.ts
│   ├── package.json
│   └── README.md
├── start.sh           # 启动脚本
└── README.md          # 本文件
```

## 快速开始

### 方法一：使用启动脚本（推荐）

```bash
chmod +x start.sh
./start.sh
```

这将自动安装依赖并启动服务器和客户端。

### 方法二：手动启动

#### 1. 启动服务器

```bash
cd ws-server
npm install
npm run start:dev
```

服务器将运行在 `http://localhost:9000`

#### 2. 启动客户端

在新的终端窗口中：

```bash
cd ws-client
npm install
npm start
```

客户端将运行在 `http://localhost:8000`

## 功能特性

### 服务器端 (ws-server)

- ✅ 基于 NestJS 框架
- ✅ Socket.io WebSocket 支持
- ✅ 实时连接管理
- ✅ 在线人数统计
- ✅ 消息广播功能
- ✅ Ping/Pong 心跳检测
- ✅ CORS 跨域支持

### 客户端 (ws-client)

- ✅ 基于 React 18
- ✅ Socket.io-client 集成
- ✅ 自定义 useWebSocket Hook
- ✅ 自动重连机制（指数退避算法）
- ✅ 连接状态管理
- ✅ 美观的 UI 界面
- ✅ 消息发送和接收
- ✅ 广播功能
- ✅ 在线人数实时显示

## WebSocket 事件

### 服务器端事件

| 事件名称 | 说明 | 数据格式 |
|---------|------|---------|
| `welcome` | 连接成功时发送 | `{ message, clientId, timestamp }` |
| `online-count` | 在线人数更新 | `{ count, timestamp }` |
| `message-response` | 消息回应 | `{ original, response, timestamp }` |
| `broadcast` | 广播消息 | `{ from, message, timestamp }` |
| `pong` | Ping响应 | `{ timestamp }` |

### 客户端事件

| 事件名称 | 说明 | 数据格式 |
|---------|------|---------|
| `message` | 发送消息 | `string` |
| `broadcast` | 广播消息 | `string` |
| `ping` | 心跳检测 | 无 |

## useWebSocket Hook

自定义 Hook，参考 `stream` 项目的实现，提供完整的 WebSocket 功能：

```typescript
const {
  socket,          // Socket 实例
  isConnected,     // 连接状态
  error,           // 错误信息
  emit,            // 发送事件
  on,              // 监听事件
  reconnect,       // 重新连接
  disconnect,      // 断开连接
} = useWebSocket({
  serverUrl: 'http://localhost:9000',
  enable: true,
  maxReconnectAttempts: 5,
  onConnect: (socket) => { /* 连接成功回调 */ },
  onDisconnect: (reason) => { /* 断开连接回调 */ },
  onError: (message, error) => { /* 错误回调 */ },
});
```

### 主要特性

- **自动重连**：采用指数退避算法，智能重连
- **事件管理**：自动管理事件监听器的注册和清理
- **类型安全**：完整的 TypeScript 类型支持
- **状态管理**：内置连接状态和错误状态管理

## 技术栈

### 服务器端

- NestJS 10
- Socket.io 4
- TypeScript 5
- Express

### 客户端

- React 18
- Socket.io-client 4
- TypeScript 5
- Create React App

## 开发说明

### 修改端口

#### 服务器端口

编辑 `ws-server/src/main.ts`:

```typescript
await app.listen(9000); // 修改端口号
```

#### 客户端端口

编辑 `ws-client/package.json`:

```json
{
  "scripts": {
    "start": "PORT=8000 react-scripts start"  // 修改端口号
  }
}
```

同时更新客户端中的服务器地址：

```typescript
// ws-client/src/App.tsx 或 useWebSocket.ts
serverUrl: 'http://localhost:9000'  // 更新服务器地址
```

### 添加新的 WebSocket 事件

#### 服务器端

在 `ws-server/src/websocket.gateway.ts` 中添加新的事件处理器：

```typescript
@SubscribeMessage('your-event')
handleYourEvent(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
  // 处理事件
  client.emit('your-response', { /* 数据 */ });
}
```

#### 客户端

使用 `on` 方法监听事件：

```typescript
useEffect(() => {
  const unsubscribe = on('your-response', (data) => {
    console.log('收到响应:', data);
  });
  return unsubscribe;
}, [on]);
```

## 测试

1. 打开浏览器访问 `http://localhost:8000`
2. 打开多个浏览器标签页测试多客户端连接
3. 测试功能：
   - 发送消息（只有发送者收到回应）
   - 广播消息（所有客户端都能收到）
   - Ping 测试（测试连接是否正常）
   - 查看在线人数变化

## 常见问题

### 1. 端口被占用

如果端口被占用，可以修改端口号或停止占用端口的进程：

```bash
# 查找占用端口的进程
lsof -i :8000
lsof -i :9000

# 停止进程
kill -9 <PID>
```

### 2. 依赖安装失败

尝试清除缓存后重新安装：

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 3. 连接失败

- 检查服务器是否已启动
- 检查防火墙设置
- 确认客户端中的 `serverUrl` 配置正确
- 查看浏览器控制台错误信息

## 许可证

MIT

