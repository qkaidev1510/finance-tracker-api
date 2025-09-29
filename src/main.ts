import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './middlewares/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = parseInt(process.env.port ?? '3000', 10);
  const corsOrigin =
    process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) ?? true;

  const config = new DocumentBuilder()
    .setTitle('Fiance Tracker API')
    .setDescription('A Side Project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({ origin: corsOrigin });

  await app.listen(port, '0.0.0.0');
  console.log('✅ Server listening on', port);
}

bootstrap();
