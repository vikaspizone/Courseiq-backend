import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables before any other imports
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ensureDatabaseExists } from './config/ensure-db';
import { AllExceptionsFilter } from './middlewares/http-exception.filter';
import { TransformInterceptor } from './middlewares/transform.interceptor';
import { setupSwagger } from './config/swagger.config';
import { logErrorToFile } from './utils/logger';

async function bootstrap() {
  // Ensure that target PostgreSQL database exists or create it
  await ensureDatabaseExists();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static assets from uploads directory
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // Register global interceptor for responses
  app.useGlobalInterceptors(new TransformInterceptor());

  // Register global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Setup Swagger
  setupSwagger(app);
  
  // Enable global validation pipe with custom error formatter
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const getFirstErrorMessage = (errorList: any[]): string => {
          for (const err of errorList) {
            if (err.constraints) {
              return Object.values(err.constraints)[0] as string;
            }
            if (err.children && err.children.length > 0) {
              const msg = getFirstErrorMessage(err.children);
              if (msg) return msg;
            }
          }
          return 'Validation failed';
        };
        const errorMessage = getFirstErrorMessage(errors);
        return new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: errorMessage,
        });
      },
    }),
  );

  // Enable CORS
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error('[Bootstrap] Application failed to start:', error);
  logErrorToFile({ error, context: 'Bootstrap' });
  process.exit(1);
});

