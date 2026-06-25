import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { validateEnv } from '@slideforge/config';

async function bootstrap(): Promise<void> {
  const env = validateEnv();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.enableCors({ origin: '*', credentials: true });

  app.setGlobalPrefix(env.API_PREFIX);

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
    SwaggerModule.setup(`${env.API_PREFIX}/docs`, app, document);
  }

  await app.listen(env.PORT);
  app.get(Logger).log(`API running on port ${env.PORT} [${env.NODE_ENV}]`);
}

bootstrap().catch((err) => {
  console.error('Failed to start API', err);
  process.exit(1);
});
