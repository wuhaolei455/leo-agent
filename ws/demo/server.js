const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3200 });

console.log("服务运行在http://localhost:3200/");

wss.on("connection", (ws) => {
  console.log("[服务器]：客官您来了~里边请");
  ws.send(`[websocket云端]您已经连接云端!数据推送中!`);
  
  // 监听客户端发送的消息
  ws.on("message", (message) => {
    console.log("收到客户端消息：", message.toString());
  });

  ws.on("close", () => {
    console.log("[服务器]：客官下次再来呢~");
  });
});