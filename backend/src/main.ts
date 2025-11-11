import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  // CORS
  app.enableCors({
    origin: '*',
    credentials: false,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MQTT Device API')
    .setDescription('API documentation for MQTT Device Management')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
      description: 'Add your JWT token as: Bearer <token>'
    })
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  // ✅ 1. Serve OpenAPI JSON at a route
  app.getHttpAdapter().get('/api/docs-json', (req, res) => {
    res.json(swaggerDocument);
  });

  // ✅ 2. (Optional) Export to a file during build
  const outputPath = join(process.cwd(), 'swagger-spec.json');
  writeFileSync(outputPath, JSON.stringify(swaggerDocument, null, 2));
  console.log(`📝 Swagger spec saved to ${outputPath}`);

  // Swagger UI
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: { persistAuthorization: true }
  });

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server is running on: http://localhost:${port}/api`);
  console.log(`📘 Swagger UI: http://localhost:${port}/api/docs`);
  console.log(`📄 OpenAPI JSON: http://localhost:${port}/api/docs-json`);
}

bootstrap();
