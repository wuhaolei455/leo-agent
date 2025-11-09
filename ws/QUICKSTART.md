# WebSocket Demo 快速启动指南

## 一键启动（推荐）

```bash
cd /Users/wuhaolei/code/demos/stream/ws
./start.sh
```

这会自动完成以下操作：
1. 检查并安装服务器依赖
2. 检查并安装客户端依赖
3. 同时启动服务器（端口 9000）和客户端（端口 8000）

## 手动启动

### 启动服务器

```bash
cd ws-server
npm install
npm run start:dev
```

### 启动客户端（新终端）

```bash
cd ws-client
npm install
npm start
```

## 访问应用

打开浏览器访问：**http://localhost:8000**

## 快速测试

1. **测试连接**
   - 打开页面后，应该看到状态显示为"已连接"
   - 收到系统消息："欢迎连接到WebSocket服务器"

2. **测试发送消息**
   - 输入框中输入任意文本
   - 点击"发送消息"按钮
   - 应该收到服务器的回应

3. **测试广播**
   - 打开多个浏览器标签页
   - 在一个标签页中输入文本
   - 点击"广播"按钮
   - 所有标签页都应该收到消息

4. **测试在线人数**
   - 打开/关闭多个标签页
   - 观察在线人数的变化

5. **测试 Ping**
   - 点击"Ping"按钮
   - 查看控制台的 pong 响应

## 项目特点

### 🚀 技术栈
- **服务器**: NestJS + Socket.io
- **客户端**: React + Socket.io-client
- **语言**: TypeScript

### ✨ 核心功能
- ✅ 实时双向通信
- ✅ 自动重连机制（指数退避算法）
- ✅ 连接状态管理
- ✅ 在线人数统计
- ✅ 消息广播
- ✅ 美观的 UI 界面

### 📦 useWebSocket Hook
参考 stream 项目实现的自定义 Hook，提供：
- 自动连接管理
- 事件监听器注册/清理
- 错误处理
- 重连逻辑
- TypeScript 类型支持

## 端口配置

| 服务 | 端口 | 配置文件 |
|-----|------|---------|
| 服务器 | 9000 | `ws-server/src/main.ts` |
| 客户端 | 8000 | `ws-client/package.json` (scripts.start) |

## 常用命令

### 服务器

```bash
# 开发模式（热重载）
npm run start:dev

# 生产构建
npm run build

# 启动生产版本
npm start
```

### 客户端

```bash
# 开发模式
npm start

# 生产构建
npm run build

# 运行测试
npm test
```

## 目录结构

```
ws/
├── ws-server/              # NestJS 服务器
│   ├── src/
│   │   ├── main.ts         # 入口文件
│   │   ├── app.module.ts   # 主模块
│   │   └── websocket.gateway.ts  # WebSocket 网关
│   └── package.json
│
├── ws-client/              # React 客户端
│   ├── src/
│   │   ├── App.tsx         # 主应用组件
│   │   ├── App.css         # 样式文件
│   │   └── hooks/
│   │       └── useWebSocket.ts  # WebSocket Hook
│   └── package.json
│
├── start.sh               # 启动脚本
└── README.md              # 详细文档
```

## WebSocket 事件列表

### 服务器 → 客户端

| 事件 | 触发时机 | 数据 |
|-----|---------|------|
| `welcome` | 客户端连接成功 | `{ message, clientId, timestamp }` |
| `online-count` | 在线人数变化 | `{ count, timestamp }` |
| `message-response` | 收到客户端消息 | `{ original, response, timestamp }` |
| `broadcast` | 广播消息 | `{ from, message, timestamp }` |
| `pong` | Ping 响应 | `{ timestamp }` |

### 客户端 → 服务器

| 事件 | 用途 | 数据 |
|-----|------|------|
| `message` | 发送消息 | `string` |
| `broadcast` | 广播消息 | `string` |
| `ping` | 心跳检测 | 无 |

## 故障排查

### 1. 端口已被占用

```bash
# 查找占用进程
lsof -i :8000
lsof -i :9000

# 杀死进程
kill -9 <PID>
```

### 2. 无法连接

- ✅ 确认服务器已启动
- ✅ 检查防火墙设置
- ✅ 验证 CORS 配置
- ✅ 查看浏览器控制台错误

### 3. 自动重连失败

- 最大重连次数：5次
- 重连延迟：指数增长（最大10秒）
- 手动重连：点击错误提示中的"重新连接"按钮

## 下一步

- 📖 阅读完整文档：`README.md`
- 🔧 自定义 WebSocket 事件
- 🎨 修改 UI 样式
- 📦 添加新功能

## 问题反馈

如果遇到问题，请检查：
1. Node.js 版本（建议 16+）
2. 依赖是否完整安装
3. 端口是否被占用
4. 控制台错误信息

祝使用愉快！🎉

