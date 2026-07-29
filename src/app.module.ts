import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { BlacklistedToken } from './databaseSchema/blacklisted-token.schema';

@Module({
  imports: [
    // Configure environment variables globally and load database config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    // Configure TypeORM asynchronously to load database configuration from ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('database')!,
    }),
    TypeOrmModule.forFeature([BlacklistedToken]), // Register here for middleware injection
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/signup', method: RequestMethod.POST },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/refresh', method: RequestMethod.POST },
        { path: '/', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
