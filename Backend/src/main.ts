import { mkdirSync } from 'fs';
import type { NextFunction, Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { UPLOADS_DIR } from './uploads/image-storage';

const BUSINESS_SERVED_FILES = /\.(?:jpe?g|jfif|png|webp|gif|pdf|docx)$/i;

async function bootstrap() {
  mkdirSync(UPLOADS_DIR, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // /uploads/businesses is filled by a public endpoint. Today it only stores the
  // types below, but anything an older version let in (an .html sent as an image)
  // must not be served as a page, so everything else there is a 404.
  app.use(
    '/uploads/businesses',
    (req: Request, res: Response, next: NextFunction) => {
      if (BUSINESS_SERVED_FILES.test(req.path)) {
        next();
        return;
      }
      res.status(404).end();
    },
  );

  app.useStaticAssets(UPLOADS_DIR, {
    prefix: '/uploads/',
    // Browsers must trust the Content-Type derived from the extension, never guess.
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
