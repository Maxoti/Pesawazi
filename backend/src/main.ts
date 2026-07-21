import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // TEMP DIAGNOSTIC: log every single incoming request, before routing/guards/pipes
  app.use((req, res, next) => {
    console.log(`[INCOMING] ${req.method} ${req.originalUrl} from ${req.ip}`);
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const corsOrigin = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? '*';
  app.enableCors({ origin: corsOrigin });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`mpesa-dashboard-backend listening on port ${port}`);
}

bootstrap();