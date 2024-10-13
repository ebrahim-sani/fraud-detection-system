import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
  });

  await app.listen(3000);
}
bootstrap();
