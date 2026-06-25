import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { getApiEnv } from '@slideforge/config';

async function bootstrap(): Promise<void> {
  const env = getApiEnv();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.enableCors({
    origin: (env as Record<string, unknown>)['WEB_URL'] as string ?? '*',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SlideForge Studio API')
      .setDescription('Backend API for SlideForge Studio')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1/docs', app, document);
  }

  const port = (env as Record<string, unknown>)['PORT'] as number ?? 3001;
  await app.listen(port);
  app.get(Logger).log(`API running on port ${port} [${env.NODE_ENV}]`);
}

bootstrap().catch((err) => {
  console.error('Failed to start API', err);
  process.exit(1);
});
