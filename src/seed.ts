import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables before any other imports
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { runDatabaseMigrations } from './utils/migrations-runner';
import { Logger } from '@nestjs/common';

const logger = new Logger('SeederCommand');

async function run() {
  logger.log('Initializing application context for database seeding...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    logger.log('Starting migration and seed execution...');
    await runDatabaseMigrations(app);
    logger.log('Migration and seeding completed successfully.');
  } catch (error) {
    logger.error('Failed to run migration and seeding command:', error);
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  console.error('Fatal error during seed execution:', error);
  process.exit(1);
});
