import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { CourseCategoriesModule } from './course-categories/course-categories.module';
import { ModulesModule } from './modules/modules.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolePermissionsModule } from './role-permissions/role-permissions.module';
import { CoursesModule } from './courses/courses.module';
import { FavoriteCoursesModule } from './favorite-courses/favorite-courses.module';
import { CourseRatingsModule } from './course-ratings/course-ratings.module';
import { CourseMediaModule } from './course-media/course-media.module';
import { CourseInstructorsModule } from './course-instructors/course-instructors.module';
import { CourseEnrollmentsModule } from './course-enrollments/course-enrollments.module';
import { CoursePurchasesModule } from './course-purchases/course-purchases.module';
import { CourseSectionsModule } from './course-sections/course-sections.module';
import { LessonsModule } from './lessons/lessons.module';
import databaseConfig from './config/database.config';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { LocaleMiddleware } from './middlewares/locale.middleware';
import { BlacklistedToken } from './databaseSchema/blacklisted-token.schema';

@Module({
  imports: [
    // Configure environment variables globally and load database config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    // Configure TypeORM asynchronously to load database configuration from ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('database')!,
    }),
    TypeOrmModule.forFeature([BlacklistedToken]),
    UsersModule,
    AuthModule,
    RolesModule,
    CourseCategoriesModule,
    ModulesModule,
    PermissionsModule,
    RolePermissionsModule,
    CoursesModule,
    FavoriteCoursesModule,
    CourseRatingsModule,
    CourseMediaModule,
    CourseInstructorsModule,
    CourseEnrollmentsModule,
    CoursePurchasesModule,
    CourseSectionsModule,
    LessonsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LocaleMiddleware)
      .forRoutes('*')
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
