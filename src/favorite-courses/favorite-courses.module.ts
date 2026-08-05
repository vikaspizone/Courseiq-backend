import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteCoursesController } from './favorite-courses.controller';
import { FavoriteCoursesService } from './favorite-courses.service';
import { FavoriteCourse } from '../databaseSchema/favorite-course.schema';
import { Course } from '../databaseSchema/course.schema';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteCourse, Course])],
  controllers: [FavoriteCoursesController],
  providers: [FavoriteCoursesService],
  exports: [FavoriteCoursesService],
})
export class FavoriteCoursesModule {}
