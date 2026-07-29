import * as dotenv from 'dotenv';
// Load environment variables before any other imports
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ensureDatabaseExists } from './config/ensure-db';

async function bootstrap() {
  // Ensure that target PostgreSQL database exists or create it
  await ensureDatabaseExists();

  const app = await NestFactory.create(AppModule);
  
  // Enable global validation pipe with custom error formatter
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties that do not have decorators
      forbidNonWhitelisted: true, // throw errors when non-whitelisted properties are present
      transform: true, // transform payloads to be objects typed according to their DTO classes
      stopAtFirstError: true, // Stops checking validation rules after the first failure on a field
      exceptionFactory: (errors) => {
        const firstError = errors[0];
        if (firstError && firstError.constraints) {
          const constraintsMessages = Object.values(firstError.constraints);
          // Return the first constraint failure message as a string
          return new BadRequestException({
            statusCode: 400,
            error: 'Bad Request',
            message: constraintsMessages[0],
          });
        }
        return new BadRequestException('Validation failed');
      },
    }),
  );

  // Enable CORS
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

