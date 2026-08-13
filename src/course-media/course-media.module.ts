import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseMediaService } from './course-media.service';
import { CourseMediaController } from './course-media.controller';
import { CourseMedia } from '../databaseSchema/course-media.schema';
import { Course } from '../databaseSchema/course.schema';

@Module({
  imports: [TypeOrmModule.forFeature([CourseMedia, Course])],
  controllers: [CourseMediaController],
  providers: [CourseMediaService],
  exports: [CourseMediaService],
})
export class CourseMediaModule {}
