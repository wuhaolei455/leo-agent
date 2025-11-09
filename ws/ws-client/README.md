# WebSocket Client

基于 React 和 Socket.io 的 WebSocket 客户端。

## 安装依赖

```bash
npm install
```

## 启动客户端

```bash
npm start
```

客户端将运行在 `http://localhost:8000`

## 功能特性

- ✅ 实时 WebSocket 连接
- ✅ 自动重连机制
- ✅ 连接状态显示
- ✅ 在线人数统计
- ✅ 发送和接收消息
- ✅ 广播消息给所有客户端
- ✅ Ping/Pong 心跳检测
- ✅ 美观的 UI 界面

## useWebSocket Hook

自定义 Hook 提供了完整的 WebSocket 功能：

### 参数

- `serverUrl`: 服务器地址（默认: `http://localhost:9000`）
- `enable`: 是否启用连接（默认: `true`）
- `maxReconnectAttempts`: 最大重连次数（默认: `5`）
- `connectionOptions`: Socket.io 连接选项
- `onConnect`: 连接成功回调
- `onDisconnect`: 断开连接回调
- `onError`: 错误回调

### 返回值

- `socket`: Socket 实例
- `isConnected`: 连接状态
- `error`: 错误信息
- `emit`: 发送事件
- `on`: 监听事件
- `reconnect`: 重新连接
- `disconnect`: 断开连接

## 使用示例

```typescript
const { isConnected, emit, on } = useWebSocket({
  serverUrl: 'http://localhost:9000',
  enable: true,
  onConnect: () => console.log('已连接'),
});

// 发送消息
emit('message', 'Hello World');

// 监听消息
useEffect(() => {
  const unsubscribe = on('message-response', (data) => {
    console.log('收到消息:', data);
  });
  return unsubscribe;
}, [on]);
```

