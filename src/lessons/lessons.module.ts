import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson } from '../databaseSchema/lesson.schema';
import { LessonTranslation } from '../databaseSchema/lesson-translation.schema';
import { CourseSection } from '../databaseSchema/course-section.schema';
import { Course } from '../databaseSchema/course.schema';
import { Language } from '../databaseSchema/language.schema';
import { CourseMedia } from '../databaseSchema/course-media.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lesson,
      LessonTranslation,
      CourseSection,
      Course,
      Language,
      CourseMedia,
    ]),
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
