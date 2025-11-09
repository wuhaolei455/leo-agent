import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS
  app.enableCors({
    origin: 'http://localhost:8000',
    credentials: true,
  });

  await app.listen(9000);
  console.log('WebSocket服务器运行在: http://localhost:9000');
}
bootstrap();

