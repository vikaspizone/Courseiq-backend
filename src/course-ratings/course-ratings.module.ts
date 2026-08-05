import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseRatingsController } from './course-ratings.controller';
import { CourseRatingsService } from './course-ratings.service';
import { CourseRating } from '../databaseSchema/course-rating.schema';
import { Course } from '../databaseSchema/course.schema';

import { CourseRatingTranslation } from '../databaseSchema/course-rating-translation.schema';
import { Language } from '../databaseSchema/language.schema';

@Module({
  imports: [TypeOrmModule.forFeature([CourseRating, Course, CourseRatingTranslation, Language])],
  controllers: [CourseRatingsController],
  providers: [CourseRatingsService],
  exports: [CourseRatingsService],
})
export class CourseRatingsModule {}
