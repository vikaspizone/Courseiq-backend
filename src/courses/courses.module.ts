import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from '../databaseSchema/course.schema';
import { CourseTranslation } from '../databaseSchema/course-translation.schema';
import { CourseCategory } from '../databaseSchema/course-category.schema';
import { Language } from '../databaseSchema/language.schema';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseTranslation, CourseCategory, Language])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
