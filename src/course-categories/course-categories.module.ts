import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseCategoriesService } from './course-categories.service';
import { CourseCategoriesController } from './course-categories.controller';
import { CourseCategory } from '../databaseSchema/course-category.schema';
import { CourseCategoryTranslation } from '../databaseSchema/course-category-translation.schema';
import { Language } from '../databaseSchema/language.schema';

@Module({
  imports: [TypeOrmModule.forFeature([CourseCategory, CourseCategoryTranslation, Language])],
  controllers: [CourseCategoriesController],
  providers: [CourseCategoriesService],
  exports: [CourseCategoriesService],
})
export class CourseCategoriesModule {}
