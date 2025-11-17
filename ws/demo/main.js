const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3200');

ws.on('open', function() {
    console.log('[客户端] WebSocket 连接已经建立。');
    ws.send('Hello, server!');
    
    // 每2秒发送一次消息
    setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send('Hello, server!');
            console.log('[客户端] 发送消息：Hello, server!');
        }
    }, 2000);
});

ws.on('message', function(data) {
    console.log('[客户端] 收到服务器消息：', data.toString());
});

ws.on('error', function(error) {
    console.error('[客户端] WebSocket 连接出现错误：', error.message);
});

ws.on('close', function() {
    console.log('[客户端] WebSocket 连接已经关闭。');
});