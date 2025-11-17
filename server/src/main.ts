import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // 使用原生 WebSocket 适配器
  app.useWebSocketAdapter(new WsAdapter(app));

  const port = Number(process.env.PORT) || 3002;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 Server is running at http://localhost:${port}`);
  console.log(`🔌 WebSocket is available at ws://localhost:${port}`);
}
bootstrap();
