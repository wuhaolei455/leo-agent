# WebSocket Server

基于 NestJS 和 Socket.io 的 WebSocket 服务器。

## 安装依赖

```bash
npm install
```

## 启动服务器

```bash
npm run start:dev
```

服务器将运行在 `http://localhost:9000`

## API 端点

- `GET /` - 服务器状态
- `GET /health` - 健康检查

## WebSocket 事件

### 服务器发送的事件

- `welcome` - 客户端连接时的欢迎消息
- `online-count` - 在线人数更新
- `message-response` - 消息回应
- `broadcast` - 广播消息
- `pong` - ping-pong响应

### 客户端可发送的事件

- `message` - 发送消息
- `ping` - ping请求
- `broadcast` - 广播消息给所有客户端

