import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

const env = process.env.NODE_ENV;
config({ path: path.resolve(process.cwd(), `.env.${env}`) });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../databaseSchema/**/*.schema.{ts,js}'],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  synchronize: false, // Set to false when using migrations
});
