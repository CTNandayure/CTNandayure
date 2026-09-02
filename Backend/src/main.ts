import { mkdirSync } from 'fs';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { UPLOADS_DIR } from './uploads/image-storage';

async function bootstrap() {
  mkdirSync(UPLOADS_DIR, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useStaticAssets(UPLOADS_DIR, { prefix: '/uploads/' });
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
