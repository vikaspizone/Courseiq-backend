import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSectionsService } from './course-sections.service';
import { CourseSectionsController } from './course-sections.controller';
import { CourseSection } from '../databaseSchema/course-section.schema';
import { CourseSectionTranslation } from '../databaseSchema/course-section-translation.schema';
import { Course } from '../databaseSchema/course.schema';
import { Language } from '../databaseSchema/language.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseSection,
      CourseSectionTranslation,
      Course,
      Language,
    ]),
  ],
  controllers: [CourseSectionsController],
  providers: [CourseSectionsService],
  exports: [CourseSectionsService],
})
export class CourseSectionsModule {}
