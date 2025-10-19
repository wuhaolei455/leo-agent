import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = Number(process.env.PORT) || 3002;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 Server is running at http://localhost:${port}`);
}
bootstrap();
