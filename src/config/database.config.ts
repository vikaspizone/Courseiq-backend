import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const url = process.env.DATABASE_URL;
  const isProduction = process.env.NODE_ENV === 'production';
  const sslEnabled = process.env.DB_SSL === 'true' || (isProduction && process.env.DB_SSL !== 'false');

  const commonOptions = {
    type: 'postgres' as const,
    autoLoadEntities: true,
    synchronize: !isProduction,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    migrations: [path.join(__dirname, '..', 'migrations', '*.{ts,js}')],
  };

  if (url) {
    return {
      ...commonOptions,
      url,
    };
  }

  return {
    ...commonOptions,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'courseiq',
  };
});
